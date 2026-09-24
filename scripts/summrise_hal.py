import sys
import asyncio
import os
import json
import httpx
from openrouter import OpenRouter

KEY = os.getenv("OPENROUTER_API_KEY", "")

# Models for generating summaries
MODEL_1 = "deepseek/deepseek-v3.2"
MODEL_2 = "google/gemini-3-pro-preview"

# Model for judging which summary is better
JUDGE_MODEL = "google/gemini-2.5-flash-lite"

def handle_api_error(e: Exception, default_return=None):
    """Handle API errors and check for credit/quota exhaustion."""
    error_msg = str(e)
    if "credit" in error_msg.lower() or "quota" in error_msg.lower() or "balance" in error_msg.lower():
        raise RuntimeError(f"API credits/quota exhausted: {error_msg}")
    if default_return is not None:
        return default_return
    raise

async def summarize_halachah(client: OpenRouter, text: str, model: str):
    """Generate a summary using the specified model."""
    try:
        response = await client.chat.send_async(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "אתה רב גדול בתורה ומורה הלכה יהודית אורתודוקסית. התפקיד שלך לתמצת הלכה למשפט קצר וברור ששומר על עיקר ההלכה ומשאיר אותה ברורה ונהירה. "
                },
                {
                    "role": "user",
                    "content": " תקצר את ההלכה הבאה לעד 40 מילים תשאיר רק טקסט פיסוק וניקוד בעברית בלבד: " + text
                }
            ]
        )
        return response.choices[0].message.content.strip()
    except (httpx.ReadError, httpx.ConnectError, httpx.TimeoutException, Exception) as e:
        return handle_api_error(e)

async def get_both_summaries(client: OpenRouter, text: str):
    """Get summaries from both models concurrently."""
    summary1_task = summarize_halachah(client, text, MODEL_1)
    summary2_task = summarize_halachah(client, text, MODEL_2)
    results = await asyncio.gather(summary1_task, summary2_task, return_exceptions=True)
    
    summary1, summary2 = results[0], results[1]
    
    # Check for errors
    if isinstance(summary1, Exception):
        raise summary1
    if isinstance(summary2, Exception):
        raise summary2
    
    return summary1, summary2

async def choose_best_summary(client: OpenRouter, original_text: str, summary1: str, summary2: str):
    """Use judge model to determine which summary is better. Returns (summary, model_number)."""
    try:
        response = await client.chat.send_async(
            model=JUDGE_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": f"""ההלכה המקורית:
{original_text}

תמצית 1:
{summary1}

תמצית 2:
{summary2}

בחר את התמצית הטובה ביותר שמשמרת את עיקר ההלכה בצורה ברורה ונהירה. החזר רק את המספר "1" או "2" ללא תוספות."""
                }
            ]
        )
        choice = response.choices[0].message.content.strip()
        # Extract just the number (1 or 2)
        if "1" in choice:
            return (summary1, 1)
        elif "2" in choice:
            return (summary2, 2)
        else:
            # Default to first summary if unclear
            return (summary1, 1)
    except (httpx.ReadError, httpx.ConnectError, httpx.TimeoutException, Exception) as e:
        # If judge fails, default to first summary
        return handle_api_error(e, default_return=(summary1, 1))

async def run(path: str, max_concurrent: int = 20, use_gpt_only: bool = True):
    files = []
    if os.path.isdir(path):
        files = [os.path.join(path, f) for f in os.listdir(path) 
                 if f.endswith('.json') and not f.endswith('_summary.json')]
    else:
        files = [path]
    for file_path in files:
        print(f"\nProcessing: {os.path.basename(file_path)}")
        if use_gpt_only:
            print("Mode: GPT only (single model)")
        else:
            print("Mode: Dual model with judge")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            output = file_path[:-5] + '_summary.json'
            book_title = data['heTitle']
            he_key = data['schema']['nodes'][1]['heTitle']
            sections = data['text'][he_key]
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            continue
        async with OpenRouter(api_key=KEY) as client:
            semaphore = asyncio.Semaphore(max_concurrent)
            progress_counter = {'completed': 0, 'total': 0}
            model_stats = {'model1': 0, 'model2': 0}

            async def summarize_with_limit(text: str, index: int):
                async with semaphore:
                    try:
                        if use_gpt_only:
                            # Use only GPT model
                            result = await summarize_halachah(client, text, MODEL_1)
                            model_stats['model1'] += 1
                            chosen_model = 1
                        else:
                            # Get summaries from both models
                            summary1, summary2 = await get_both_summaries(client, text)
                            # Use judge model to choose the best one
                            result, chosen_model = await choose_best_summary(client, text, summary1, summary2)
                            # Track statistics
                            if chosen_model == 1:
                                model_stats['model1'] += 1
                            elif chosen_model == 2:
                                model_stats['model2'] += 1
                        progress_counter['completed'] += 1
                        completed = progress_counter['completed']
                        total = progress_counter['total']
                        percentage = (completed / total * 100) if total > 0 else 0
                        print(f"Progress: {completed}/{total} ({percentage:.1f}%)", end='\r', flush=True)
                        return (result, None)  # (result, error)
                    except RuntimeError as e:
                        # API credits/quota error - propagate to stop processing
                        progress_counter['completed'] += 1
                        raise
                    except Exception as e:
                        # Other errors - return error but continue
                        progress_counter['completed'] += 1
                        completed = progress_counter['completed']
                        total = progress_counter['total']
                        percentage = (completed / total * 100) if total > 0 else 0
                        print(f"Progress: {completed}/{total} ({percentage:.1f}%) [Error in section {index}]", end='\r', flush=True)
                        return (None, str(e))  # (result, error)

            # Create all tasks
            tasks = []
            section_index = 0
            for chapter in sections:
                for section in chapter:
                    progress_counter['total'] += 1
                    section_index += 1
                    tasks.append(summarize_with_limit('\n'.join(section), section_index))

            print(f"Starting processing of {progress_counter['total']} sections...")
            
            # Execute with concurrency limit - return_exceptions to continue on errors
            task_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results and separate successful from failed
            results = []
            errors = []
            credits_exhausted = False
            
            for i, task_result in enumerate(task_results):
                if isinstance(task_result, RuntimeError):
                    # Credits exhausted - stop processing
                    credits_exhausted = True
                    error_msg = str(task_result)
                    print(f"\n\n⚠️  CREDITS EXHAUSTED: {error_msg}")
                    print(f"Stopping processing. Saving {len(results)} completed sections...")
                    break
                elif isinstance(task_result, Exception):
                    errors.append(f"Section {i+1}: {task_result}")
                    results.append(None)  # Placeholder for failed section
                elif isinstance(task_result, tuple):
                    result, error = task_result
                    if error:
                        errors.append(f"Section {i+1}: {error}")
                    results.append(result)
                else:
                    results.append(task_result)
            
            completed_count = len([r for r in results if r is not None])
            print(f"\nCompleted: {completed_count}/{progress_counter['total']} sections processed")
            
            if errors:
                print(f"\n⚠️  Errors encountered: {len(errors)}")
                if len(errors) <= 10:
                    for error in errors:
                        print(f"  - {error}")
                else:
                    print(f"  (Showing first 10 of {len(errors)} errors)")
                    for error in errors[:10]:
                        print(f"  - {error}")

            # Print statistics
            total_processed = completed_count
            if total_processed > 0 and not use_gpt_only:
                model1_count = model_stats['model1']
                model2_count = model_stats['model2']
                model1_pct = (model1_count / total_processed * 100) if total_processed > 0 else 0
                model2_pct = (model2_count / total_processed * 100) if total_processed > 0 else 0
                
                print(f"\nModel Selection Statistics:")
                print(f"  {MODEL_1}: {model1_count}/{total_processed} ({model1_pct:.1f}%)")
                print(f"  {MODEL_2}: {model2_count}/{total_processed} ({model2_pct:.1f}%)")
            elif use_gpt_only:
                print(f"\nUsing single model: {MODEL_1}")

            # Save results (including partial results)
            output_data = {
                'book_title': book_title,
                'sections': results,
            }

            with open(output, 'w', encoding='utf-8') as out_file:
                json.dump(output_data, out_file, ensure_ascii=False, indent=4)
            
            if credits_exhausted:
                print(f"✓ Partial results saved: {os.path.basename(output)}")
                print(f"  You can resume processing later or add more credits.")
            else:
                print(f"✓ Saved: {os.path.basename(output)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python summrise_hal.py <file_or_folder_path> [--gpt-only]")
        sys.exit(1)
    
    path = sys.argv[1]
    use_gpt_only = '--gpt-only' in sys.argv or '-g' in sys.argv
    
    asyncio.run(run(path, use_gpt_only=use_gpt_only))