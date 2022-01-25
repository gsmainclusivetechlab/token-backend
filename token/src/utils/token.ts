import crypto from 'crypto';
export class Token {
  static generate(phoneNumber: string, indicative: string) {
    const generateRandom = (multiplierLength: number) => {
      const power = Math.pow(10, multiplierLength);
      const random = crypto.randomBytes(4).readUInt32LE() / 0x100000000;
      const multiplier = Math.floor(random * power) + 1 * power;
      const timestamp = new Date().getTime();
      return String(multiplier * timestamp).substring(0, phoneNumber.length);
    };

    const generateControlDigit = (randomNumber: string) => {
      const randomArray = randomNumber.split('');
      const primeArray = primeNumbers(randomNumber.length);
      const primeMultiply = randomArray.map((el, i) => +el * primeArray[i]);
      const primeSum = primeMultiply.reduce((acc, el) => el + acc, 0);
      const mod11 = primeSum % 11;
      return mod11 % 10;
    };

    const randomToken = generateRandom(phoneNumber.length - 1);
    const controlDigit = generateControlDigit(randomToken);
    return indicative + randomToken + controlDigit;
  }

  static verifyControlDigit(token: string, indicative: string) {
    const controlDigit = +token[token.length - 1];
    const tokenWithoutControlDigit = token.substring(0, token.length - 1);
    const tokenWithoutIndicative = tokenWithoutControlDigit.split(indicative.split('+')[1])[1];
    const primeArray = primeNumbers(tokenWithoutIndicative.length);
    const tokenArray = tokenWithoutIndicative.split('');
    const primeMultiply = tokenArray.map((el, i) => +el * primeArray[i]);
    const primeSum = primeMultiply.reduce((acc, el) => el + acc, 0);
    const mod11 = primeSum % 11;
    return (mod11 % 10) === controlDigit;
  }
}

function primeNumbers(n: number) {
  const array: number[] = [];
  for (var i = 2; array.length < n; i++) {
    let divisorFound = false;
    for (var count = 2; count < i; count++) {
      if (i % count === 0) {
        divisorFound = true;
        break;
      }
    }
    if (divisorFound == false) {
      array.push(i);
    }
  }
  return array;
}
