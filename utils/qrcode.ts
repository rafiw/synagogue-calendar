//---------------------------------------------------------------------
// QRCode for JavaScript (adapted to TypeScript)
// Copyright (c) 2009 Kazuhiko Arase
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//---------------------------------------------------------------------

const MODE_8BIT_BYTE = 1 << 2;

export const QRErrorCorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
} as const;

export type ErrorCorrectLevel = (typeof QRErrorCorrectLevel)[keyof typeof QRErrorCorrectLevel];

const QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
} as const;

const EXP_TABLE = new Array<number>(256);
const LOG_TABLE = new Array<number>(256);

for (let i = 0; i < 8; i++) {
  EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] = EXP_TABLE[i - 4]! ^ EXP_TABLE[i - 5]! ^ EXP_TABLE[i - 6]! ^ EXP_TABLE[i - 8]!;
}
for (let i = 0; i < 255; i++) {
  LOG_TABLE[EXP_TABLE[i]!] = i;
}

const QRMath = {
  glog(n: number): number {
    if (n < 1) {
      throw new Error(`glog(${n})`);
    }
    return LOG_TABLE[n]!;
  },
  gexp(n: number): number {
    let val = n;
    while (val < 0) {
      val += 255;
    }
    while (val >= 256) {
      val -= 255;
    }
    return EXP_TABLE[val]!;
  },
};

class QRPolynomial {
  private num: number[];

  constructor(num: number[], shift: number) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset++;
    }
    this.num = new Array(num.length - offset + shift).fill(0);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset]!;
    }
  }

  get(index: number): number {
    return this.num[index] ?? 0;
  }

  getLength(): number {
    return this.num.length;
  }

  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array<number>(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
      }
    }
    return new QRPolynomial(num, 0);
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    const num = new Array<number>(this.getLength());
    for (let i = 0; i < this.getLength(); i++) {
      num[i] = this.get(i);
    }
    for (let x = 0; x < e.getLength(); x++) {
      num[x]! ^= QRMath.gexp(QRMath.glog(e.get(x)) + ratio);
    }
    return new QRPolynomial(num, 0).mod(e);
  }
}

const RS_BLOCK_TABLE: number[][] = [
  // 1
  [1, 26, 19],
  [1, 26, 16],
  [1, 26, 13],
  [1, 26, 9],
  // 2
  [1, 44, 34],
  [1, 44, 28],
  [1, 44, 22],
  [1, 44, 16],
  // 3
  [1, 70, 55],
  [1, 70, 44],
  [2, 35, 17],
  [2, 35, 13],
  // 4
  [1, 100, 80],
  [2, 50, 32],
  [2, 50, 24],
  [4, 25, 9],
  // 5
  [1, 134, 108],
  [2, 67, 43],
  [2, 33, 15, 2, 34, 16],
  [2, 33, 11, 2, 34, 12],
  // 6
  [2, 86, 68],
  [4, 43, 27],
  [4, 43, 19],
  [4, 43, 15],
  // 7
  [2, 98, 78],
  [4, 49, 31],
  [2, 32, 14, 4, 33, 15],
  [4, 39, 13, 1, 40, 14],
  // 8
  [2, 121, 97],
  [2, 60, 38, 2, 61, 39],
  [4, 40, 18, 2, 41, 19],
  [4, 40, 14, 2, 41, 15],
  // 9
  [2, 146, 116],
  [3, 58, 36, 2, 59, 37],
  [4, 36, 16, 4, 37, 17],
  [4, 36, 12, 4, 37, 13],
  // 10
  [2, 86, 68, 2, 87, 69],
  [4, 69, 43, 1, 70, 44],
  [6, 43, 19, 2, 44, 20],
  [6, 43, 15, 2, 44, 16],
  // 11
  [4, 101, 81],
  [1, 80, 50, 4, 81, 51],
  [4, 50, 22, 4, 51, 23],
  [3, 36, 12, 8, 37, 13],
  // 12
  [2, 116, 92, 2, 117, 93],
  [6, 58, 36, 2, 59, 37],
  [4, 46, 20, 6, 47, 21],
  [7, 42, 14, 4, 43, 15],
  // 13
  [4, 133, 107],
  [8, 59, 37, 1, 60, 38],
  [8, 44, 20, 4, 45, 21],
  [12, 33, 11, 4, 34, 12],
  // 14
  [3, 145, 115, 1, 146, 116],
  [4, 64, 40, 5, 65, 41],
  [11, 36, 16, 5, 37, 17],
  [11, 36, 12, 5, 37, 13],
  // 15
  [5, 109, 87, 1, 110, 88],
  [5, 65, 41, 5, 66, 42],
  [5, 54, 24, 7, 55, 25],
  [11, 36, 12],
  // 16
  [5, 122, 98, 1, 123, 99],
  [7, 73, 45, 3, 74, 46],
  [15, 43, 19, 2, 44, 20],
  [3, 45, 15, 13, 46, 16],
  // 17
  [1, 135, 107, 5, 136, 108],
  [10, 74, 46, 1, 75, 47],
  [1, 50, 22, 15, 51, 23],
  [2, 42, 14, 17, 43, 15],
  // 18
  [5, 150, 120, 1, 151, 121],
  [9, 69, 43, 4, 70, 44],
  [17, 50, 22, 1, 51, 23],
  [2, 42, 14, 19, 43, 15],
  // 19
  [3, 141, 113, 4, 142, 114],
  [3, 70, 44, 11, 71, 45],
  [17, 47, 21, 4, 48, 22],
  [9, 39, 13, 16, 40, 14],
  // 20
  [3, 135, 107, 5, 136, 108],
  [3, 67, 41, 13, 68, 42],
  [15, 54, 24, 5, 55, 25],
  [15, 43, 15, 10, 44, 16],
  // 21
  [4, 144, 116, 4, 145, 117],
  [17, 68, 42],
  [17, 50, 22, 6, 51, 23],
  [19, 46, 16, 6, 47, 17],
  // 22
  [2, 139, 111, 7, 140, 112],
  [17, 74, 46],
  [7, 54, 24, 16, 55, 25],
  [34, 37, 13],
  // 23
  [4, 151, 121, 5, 152, 122],
  [4, 75, 47, 14, 76, 48],
  [11, 54, 24, 14, 55, 25],
  [16, 45, 15, 14, 46, 16],
  // 24
  [6, 147, 117, 4, 148, 118],
  [6, 73, 45, 14, 74, 46],
  [11, 54, 24, 16, 55, 25],
  [30, 46, 16, 2, 47, 17],
  // 25
  [8, 132, 106, 4, 133, 107],
  [8, 75, 47, 13, 76, 48],
  [7, 54, 24, 22, 55, 25],
  [22, 45, 15, 13, 46, 16],
  // 26
  [10, 142, 114, 2, 143, 115],
  [19, 74, 46, 4, 75, 47],
  [28, 50, 22, 6, 51, 23],
  [33, 46, 16, 4, 47, 17],
  // 27
  [8, 152, 122, 4, 153, 123],
  [22, 73, 45, 3, 74, 46],
  [8, 53, 23, 26, 54, 24],
  [12, 45, 15, 28, 46, 16],
  // 28
  [3, 147, 117, 10, 148, 118],
  [3, 73, 45, 23, 74, 46],
  [4, 54, 24, 31, 55, 25],
  [11, 45, 15, 31, 46, 16],
  // 29
  [7, 146, 116, 7, 147, 117],
  [21, 73, 45, 7, 74, 46],
  [1, 53, 23, 37, 54, 24],
  [19, 45, 15, 26, 46, 16],
  // 30
  [5, 145, 115, 10, 146, 116],
  [19, 75, 47, 10, 76, 48],
  [15, 54, 24, 25, 55, 25],
  [23, 45, 15, 25, 46, 16],
  // 31
  [13, 145, 115, 3, 146, 116],
  [2, 74, 46, 29, 75, 47],
  [42, 54, 24, 1, 55, 25],
  [23, 45, 15, 28, 46, 16],
  // 32
  [17, 145, 115],
  [10, 74, 46, 23, 75, 47],
  [10, 54, 24, 35, 55, 25],
  [19, 45, 15, 35, 46, 16],
  // 33
  [17, 145, 115, 1, 146, 116],
  [14, 74, 46, 21, 75, 47],
  [29, 54, 24, 19, 55, 25],
  [11, 45, 15, 46, 46, 16],
  // 34
  [13, 145, 115, 6, 146, 116],
  [14, 74, 46, 23, 75, 47],
  [44, 54, 24, 7, 55, 25],
  [59, 46, 16, 1, 47, 17],
  // 35
  [12, 151, 121, 7, 152, 122],
  [12, 75, 47, 26, 76, 48],
  [39, 54, 24, 14, 55, 25],
  [22, 45, 15, 41, 46, 16],
  // 36
  [6, 151, 121, 14, 152, 122],
  [6, 75, 47, 34, 76, 48],
  [46, 54, 24, 10, 55, 25],
  [2, 45, 15, 64, 46, 16],
  // 37
  [17, 152, 122, 4, 153, 123],
  [29, 74, 46, 14, 75, 47],
  [49, 54, 24, 10, 55, 25],
  [24, 45, 15, 46, 46, 16],
  // 38
  [4, 152, 122, 18, 153, 123],
  [13, 74, 46, 32, 75, 47],
  [48, 54, 24, 14, 55, 25],
  [42, 45, 15, 32, 46, 16],
  // 39
  [20, 147, 117, 4, 148, 118],
  [40, 75, 47, 7, 76, 48],
  [43, 54, 24, 22, 55, 25],
  [10, 45, 15, 67, 46, 16],
  // 40
  [19, 148, 118, 6, 149, 119],
  [18, 75, 47, 31, 76, 48],
  [34, 54, 24, 34, 55, 25],
  [20, 45, 15, 61, 46, 16],
];

interface RSBlock {
  totalCount: number;
  dataCount: number;
}

const getRsBlockTable = (typeNumber: number, errorCorrectLevel: ErrorCorrectLevel): number[] | undefined => {
  switch (errorCorrectLevel) {
    case QRErrorCorrectLevel.L:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
    case QRErrorCorrectLevel.M:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
    case QRErrorCorrectLevel.Q:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
    case QRErrorCorrectLevel.H:
      return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
    default:
      return undefined;
  }
};

const getRSBlocks = (typeNumber: number, errorCorrectLevel: ErrorCorrectLevel): RSBlock[] => {
  const rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);
  if (!rsBlock) {
    throw new Error(`bad rs block @ typeNumber:${typeNumber}/errorCorrectLevel:${errorCorrectLevel}`);
  }
  const length = rsBlock.length / 3;
  const list: RSBlock[] = [];
  for (let i = 0; i < length; i++) {
    const count = rsBlock[i * 3 + 0]!;
    const totalCount = rsBlock[i * 3 + 1]!;
    const dataCount = rsBlock[i * 3 + 2]!;
    for (let j = 0; j < count; j++) {
      list.push({ totalCount, dataCount });
    }
  }
  return list;
};

class QRBitBuffer {
  buffer: number[] = [];
  length = 0;

  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex]! >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  getLengthInBits(): number {
    return this.length;
  }

  putBit(bit: boolean): void {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex]! |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

class QR8bitByte {
  mode = MODE_8BIT_BYTE;
  private bytes: number[];

  constructor(data: string) {
    // Encode UTF-8 bytes safely
    if (typeof TextEncoder !== 'undefined') {
      this.bytes = Array.from(new TextEncoder().encode(data));
    } else {
      const encoded = unescape(encodeURIComponent(data));
      this.bytes = [];
      for (let i = 0; i < encoded.length; i++) {
        this.bytes.push(encoded.charCodeAt(i));
      }
    }
  }

  getLength(): number {
    return this.bytes.length;
  }

  write(buffer: QRBitBuffer): void {
    for (let i = 0; i < this.bytes.length; i++) {
      buffer.put(this.bytes[i]!, 8);
    }
  }
}

const PATTERN_POSITION_TABLE: number[][] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

const getBCHDigit = (data: number): number => {
  let digit = 0;
  let val = data;
  while (val !== 0) {
    digit++;
    val >>>= 1;
  }
  return digit;
};

const QRUtil = {
  getBCHTypeInfo(data: number): number {
    let d = data << 10;
    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
      d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
    }
    return ((data << 10) | d) ^ G15_MASK;
  },

  getBCHTypeNumber(data: number): number {
    let d = data << 12;
    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
      d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
    }
    return (data << 12) | d;
  },

  getPatternPosition(typeNumber: number): number[] {
    return PATTERN_POSITION_TABLE[typeNumber - 1] || [];
  },

  getMask(maskPattern: number, i: number, j: number): boolean {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000:
        return (i + j) % 2 === 0;
      case QRMaskPattern.PATTERN001:
        return i % 2 === 0;
      case QRMaskPattern.PATTERN010:
        return j % 3 === 0;
      case QRMaskPattern.PATTERN011:
        return (i + j) % 3 === 0;
      case QRMaskPattern.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case QRMaskPattern.PATTERN101:
        return ((i * j) % 2) + ((i * j) % 3) === 0;
      case QRMaskPattern.PATTERN110:
        return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case QRMaskPattern.PATTERN111:
        return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
      default:
        throw new Error(`bad maskPattern:${maskPattern}`);
    }
  },

  getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  },

  getLengthInBits(mode: number, type: number): number {
    if (1 <= type && type < 10) {
      if (mode === MODE_8BIT_BYTE) return 8;
    } else if (type < 41) {
      if (mode === MODE_8BIT_BYTE) return 16;
    }
    throw new Error(`mode:${mode}, type:${type}`);
  },

  getLostPoint(qrCode: { getModuleCount(): number; isDark(r: number, c: number): boolean }): number {
    const moduleCount = qrCode.getModuleCount();
    let lostPoint = 0;

    // LEVEL 1
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        let sameCount = 0;
        const dark = qrCode.isDark(row, col);
        for (let r = -1; r <= 1; r++) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (let c = -1; c <= 1; c++) {
            if (col + c < 0 || moduleCount <= col + c) continue;
            if (r === 0 && c === 0) continue;
            if (dark === qrCode.isDark(row + r, col + c)) {
              sameCount++;
            }
          }
        }
        if (sameCount > 5) {
          lostPoint += 3 + sameCount - 5;
        }
      }
    }

    // LEVEL 2
    for (let row = 0; row < moduleCount - 1; row++) {
      for (let col = 0; col < moduleCount - 1; col++) {
        let count = 0;
        if (qrCode.isDark(row, col)) count++;
        if (qrCode.isDark(row + 1, col)) count++;
        if (qrCode.isDark(row, col + 1)) count++;
        if (qrCode.isDark(row + 1, col + 1)) count++;
        if (count === 0 || count === 4) {
          lostPoint += 3;
        }
      }
    }

    // LEVEL 3
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount - 6; col++) {
        if (
          qrCode.isDark(row, col) &&
          !qrCode.isDark(row, col + 1) &&
          qrCode.isDark(row, col + 2) &&
          qrCode.isDark(row, col + 3) &&
          qrCode.isDark(row, col + 4) &&
          !qrCode.isDark(row, col + 5) &&
          qrCode.isDark(row, col + 6)
        ) {
          lostPoint += 40;
        }
      }
    }

    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount - 6; row++) {
        if (
          qrCode.isDark(row, col) &&
          !qrCode.isDark(row + 1, col) &&
          qrCode.isDark(row + 2, col) &&
          qrCode.isDark(row + 3, col) &&
          qrCode.isDark(row + 4, col) &&
          !qrCode.isDark(row + 5, col) &&
          qrCode.isDark(row + 6, col)
        ) {
          lostPoint += 40;
        }
      }
    }

    // LEVEL 4
    let darkCount = 0;
    for (let col = 0; col < moduleCount; col++) {
      for (let row = 0; row < moduleCount; row++) {
        if (qrCode.isDark(row, col)) {
          darkCount++;
        }
      }
    }

    const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;

    return lostPoint;
  },
};

const PAD0 = 0xec;
const PAD1 = 0x11;

export function generateQrMatrix(
  input: string,
  errorCorrectLevel: ErrorCorrectLevel = QRErrorCorrectLevel.M,
): boolean[][] {
  const data = new QR8bitByte(input);
  const dataList = [data];

  let typeNumber = 1;
  for (typeNumber = 1; typeNumber < 40; typeNumber++) {
    const rsBlocks = getRSBlocks(typeNumber, errorCorrectLevel);
    const buffer = new QRBitBuffer();
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i]!.dataCount;
    }
    for (let x = 0; x < dataList.length; x++) {
      const d = dataList[x]!;
      buffer.put(d.mode, 4);
      buffer.put(d.getLength(), QRUtil.getLengthInBits(d.mode, typeNumber));
      d.write(buffer);
    }
    if (buffer.getLengthInBits() <= totalDataCount * 8) {
      break;
    }
  }

  let modules: (boolean | null)[][] = [];
  let moduleCount = 0;
  let dataCache: number[] | null = null;

  const isDark = (row: number, col: number): boolean => {
    return Boolean(modules[row]?.[col]);
  };

  const getModuleCount = (): number => moduleCount;

  const setupPositionProbePattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          modules[row + r]![col + c] = true;
        } else {
          modules[row + r]![col + c] = false;
        }
      }
    }
  };

  const setupPositionAdjustPattern = () => {
    const pos = QRUtil.getPatternPosition(typeNumber);
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i]!;
        const col = pos[j]!;
        if (modules[row]?.[col] !== null) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
              modules[row + r]![col + c] = true;
            } else {
              modules[row + r]![col + c] = false;
            }
          }
        }
      }
    }
  };

  const setupTimingPattern = () => {
    for (let r = 8; r < moduleCount - 8; r++) {
      if (modules[r]![6] !== null) continue;
      modules[r]![6] = r % 2 === 0;
    }
    for (let c = 8; c < moduleCount - 8; c++) {
      if (modules[6]![c] !== null) continue;
      modules[6]![c] = c % 2 === 0;
    }
  };

  const setupTypeNumber = (test: boolean) => {
    const bits = QRUtil.getBCHTypeNumber(typeNumber);
    for (let i = 0; i < 18; i++) {
      const mod = !test && ((bits >> i) & 1) === 1;
      modules[Math.floor(i / 3)]![(i % 3) + moduleCount - 8 - 3] = mod;
    }
    for (let x = 0; x < 18; x++) {
      const mod = !test && ((bits >> x) & 1) === 1;
      modules[(x % 3) + moduleCount - 8 - 3]![Math.floor(x / 3)] = mod;
    }
  };

  const setupTypeInfo = (test: boolean, maskPattern: number) => {
    const dataInfo = (errorCorrectLevel << 3) | maskPattern;
    const bits = QRUtil.getBCHTypeInfo(dataInfo);

    for (let v = 0; v < 15; v++) {
      const mod = !test && ((bits >> v) & 1) === 1;
      if (v < 6) {
        modules[v]![8] = mod;
      } else if (v < 8) {
        modules[v + 1]![8] = mod;
      } else {
        modules[moduleCount - 15 + v]![8] = mod;
      }
    }

    for (let h = 0; h < 15; h++) {
      const mod = !test && ((bits >> h) & 1) === 1;
      if (h < 8) {
        modules[8]![moduleCount - h - 1] = mod;
      } else if (h < 9) {
        modules[8]![15 - h - 1 + 1] = mod;
      } else {
        modules[8]![15 - h - 1] = mod;
      }
    }

    modules[moduleCount - 8]![8] = !test;
  };

  const createBytes = (buffer: QRBitBuffer, rsBlocks: RSBlock[]): number[] => {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const dcdata = new Array<number[]>(rsBlocks.length);
    const ecdata = new Array<number[]>(rsBlocks.length);

    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r]!.dataCount;
      const ecCount = rsBlocks[r]!.totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array<number>(dcCount);
      for (let i = 0; i < dcCount; i++) {
        dcdata[r]![i] = 0xff & (buffer.buffer[i + offset] ?? 0);
      }
      offset += dcCount;

      const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new QRPolynomial(dcdata[r]!, rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array<number>(rsPoly.getLength() - 1);
      for (let x = 0; x < ecdata[r]!.length; x++) {
        const modIndex = x + modPoly.getLength() - ecdata[r]!.length;
        ecdata[r]![x] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
    }

    let totalCodeCount = 0;
    for (let y = 0; y < rsBlocks.length; y++) {
      totalCodeCount += rsBlocks[y]!.totalCount;
    }

    const result = new Array<number>(totalCodeCount);
    let index = 0;
    for (let z = 0; z < maxDcCount; z++) {
      for (let s = 0; s < rsBlocks.length; s++) {
        if (z < dcdata[s]!.length) {
          result[index++] = dcdata[s]![z]!;
        }
      }
    }
    for (let xx = 0; xx < maxEcCount; xx++) {
      for (let t = 0; t < rsBlocks.length; t++) {
        if (xx < ecdata[t]!.length) {
          result[index++] = ecdata[t]![xx]!;
        }
      }
    }
    return result;
  };

  const createData = (): number[] => {
    const rsBlocks = getRSBlocks(typeNumber, errorCorrectLevel);
    const buffer = new QRBitBuffer();
    for (let i = 0; i < dataList.length; i++) {
      const d = dataList[i]!;
      buffer.put(d.mode, 4);
      buffer.put(d.getLength(), QRUtil.getLengthInBits(d.mode, typeNumber));
      d.write(buffer);
    }

    let totalDataCount = 0;
    for (let x = 0; x < rsBlocks.length; x++) {
      totalDataCount += rsBlocks[x]!.dataCount;
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error(`code length overflow. (${buffer.getLengthInBits()}>${totalDataCount * 8})`);
    }

    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }

    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(PAD0, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(PAD1, 8);
    }

    return createBytes(buffer, rsBlocks);
  };

  const mapData = (bytes: number[], maskPattern: number) => {
    let inc = -1;
    let row = moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;

    for (let col = moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (modules[row]![col - c] === null) {
            let dark = false;
            if (byteIndex < bytes.length) {
              dark = ((bytes[byteIndex]! >>> bitIndex) & 1) === 1;
            }
            const mask = QRUtil.getMask(maskPattern, row, col - c);
            if (mask) {
              dark = !dark;
            }
            modules[row]![col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  };

  const makeImpl = (test: boolean, maskPattern: number) => {
    moduleCount = typeNumber * 4 + 17;
    modules = new Array(moduleCount);
    for (let row = 0; row < moduleCount; row++) {
      modules[row] = new Array<boolean | null>(moduleCount).fill(null);
    }

    setupPositionProbePattern(0, 0);
    setupPositionProbePattern(moduleCount - 7, 0);
    setupPositionProbePattern(0, moduleCount - 7);
    setupPositionAdjustPattern();
    setupTimingPattern();
    setupTypeInfo(test, maskPattern);

    if (typeNumber >= 7) {
      setupTypeNumber(test);
    }

    if (dataCache === null) {
      dataCache = createData();
    }

    mapData(dataCache, maskPattern);
  };

  let minLostPoint = 0;
  let bestPattern = 0;
  for (let i = 0; i < 8; i++) {
    makeImpl(true, i);
    const lostPoint = QRUtil.getLostPoint({ getModuleCount, isDark });
    if (i === 0 || minLostPoint > lostPoint) {
      minLostPoint = lostPoint;
      bestPattern = i;
    }
  }

  makeImpl(false, bestPattern);

  return modules.map((row) => row.map((cell) => Boolean(cell)));
}

export interface CredentialsPayload {
  gistId?: string;
  githubKey?: string;
  imgbbApiKey?: string;
}

export const buildCredentialsSetupUrl = (
  payload: CredentialsPayload,
  baseUrl: string = 'https://rafiw.github.io/synagogue-calendar/settings/general',
): string => {
  const params = new URLSearchParams();
  if (payload.gistId?.trim()) {
    params.set('gistId', payload.gistId.trim());
  }
  if (payload.githubKey?.trim()) {
    params.set('githubKey', payload.githubKey.trim());
  }
  if (payload.imgbbApiKey?.trim()) {
    params.set('imgbbKey', payload.imgbbApiKey.trim());
  }
  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
};

export const parseCredentialsFromParams = (
  params: Record<string, string | string[] | undefined>,
  rawSearchString?: string,
): CredentialsPayload | null => {
  const getSingle = (val: string | string[] | undefined): string | undefined => {
    if (Array.isArray(val)) return val[0]?.trim() || undefined;
    if (typeof val === 'string') return val.trim() || undefined;
    return undefined;
  };

  let gistId = getSingle(params.gistId);
  let githubKey = getSingle(params.githubKey);
  let imgbbApiKey = getSingle(params.imgbbKey) || getSingle(params.imgbbApiKey);

  // Fallback to raw window.location.search if params object didn't capture nested query params
  const searchToParse =
    rawSearchString !== undefined
      ? rawSearchString
      : typeof window !== 'undefined' && window.location?.search
        ? window.location.search
        : '';

  if (searchToParse && (!gistId || !githubKey || !imgbbApiKey)) {
    const urlParams = new URLSearchParams(searchToParse);
    gistId = gistId || urlParams.get('gistId')?.trim() || undefined;
    githubKey = githubKey || urlParams.get('githubKey')?.trim() || undefined;
    imgbbApiKey = imgbbApiKey || urlParams.get('imgbbKey')?.trim() || urlParams.get('imgbbApiKey')?.trim() || undefined;
  }

  if (!gistId && !githubKey && !imgbbApiKey) {
    return null;
  }

  return {
    ...(gistId ? { gistId } : {}),
    ...(githubKey ? { githubKey } : {}),
    ...(imgbbApiKey ? { imgbbApiKey } : {}),
  };
};
