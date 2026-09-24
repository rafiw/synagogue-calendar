export interface DailyHalakhaItem {
  book_title: string;
  holiday: string;
  sections: string[];
}

let cachedDailyHalakhaData: DailyHalakhaItem[] | null = null;
let pendingDailyHalakhaDataLoad: Promise<DailyHalakhaItem[]> | null = null;

export const loadDailyHalakhaData = async (): Promise<DailyHalakhaItem[]> => {
  if (cachedDailyHalakhaData) {
    return cachedDailyHalakhaData;
  }

  if (!pendingDailyHalakhaDataLoad) {
    pendingDailyHalakhaDataLoad = import('../assets/data/daily_halakha.json')
      .then((module) => {
        const data = (module.default ?? module) as DailyHalakhaItem[];
        cachedDailyHalakhaData = data;
        return data;
      })
      .finally(() => {
        pendingDailyHalakhaDataLoad = null;
      });
  }

  return pendingDailyHalakhaDataLoad;
};
