/* eslint-disable no-magic-numbers */
import { formatTime, modulo, generateRandomID, random } from "../../src/assets/js/utils";

describe("Utils tests", () => {
  const MAX_ITER = 10;

  it("formatTime should correctly format time", () => {
    const seconds = [0, 60, 3600, 8640000, 91, 3601];
    const answers = ["00:00", "01:00", "60:00", "144000:00", "01:31", "60:01"];
    for (let i = 0; i < seconds.length; ++i) {
      expect(formatTime(seconds[i])).toEqual(answers[i]);
    }
  });

  it("generateRandomID should generate a random ID of different lengths", () => {
    const lengths = [0, 10, 50, 1000];
    const expectedChars = "0123456789";
    for (const _length of lengths) {
      const generatedID = generateRandomID(_length);
      expect(generatedID.length).toEqual(_length);
      for (const _char of generatedID) expect(expectedChars.search(_char)).not.toEqual(-1);
    }
  });

  it("generateRandomID should generate a random ID of length X by default", () => {
    const lengthX = 10;
    expect(generateRandomID().length).toEqual(lengthX);
  });

  it("generateRandomID should generate a valid random ID", () => {
    const epsilon = 0.1;
    const max = MAX_ITER ** 2;
    const expectedChars = "0123456789";
    let generatedID;
    let splittedGeneratedID;
    let maxCategoryPartition = expectedChars.length / max;
    maxCategoryPartition += Math.floor(maxCategoryPartition * epsilon);
    const doRetry = () => {
      generatedID = generateRandomID(max);
      splittedGeneratedID = generatedID.split('');
    }
    doRetry();
    for (const _char of generatedID) {
      if (splittedGeneratedID.filter((__char) => __char === _char).length > maxCategoryPartition) {
        maxCategoryPartition += Math.floor(maxCategoryPartition * epsilon);
        doRetry();
        break;
      }
    }
    for (const _char of generatedID) {
      expect(splittedGeneratedID.filter((__char) => __char === _char).length <= maxCategoryPartition);
    }
  });

  it("random should return a random int between min, and max", () => {
    const min = 0;
    const max = MAX_ITER;
    const probMaxIter = max ** 2;
    const epsilon = 0.1;
    let maxCategoryPartition = probMaxIter / max;
    maxCategoryPartition += Math.floor(maxCategoryPartition * epsilon);
    let receivedNumbers;
    const doRetry = () => {
      receivedNumbers = [];
      for (let i = 0; i < probMaxIter; ++i) {
        receivedNumbers.push(random(min, max));
      }
    }
    doRetry();
    expect(receivedNumbers.length).toEqual(probMaxIter);
    for (const nReceived of receivedNumbers) {
      if (nReceived > maxCategoryPartition) {
        maxCategoryPartition += Math.floor(maxCategoryPartition * epsilon);
        doRetry();
        break;
      }
    }
    for (const nReceived of receivedNumbers) {
      expect(nReceived <= maxCategoryPartition).toBeTruthy();
    }
  });

  it("modulo should correctly return the modulo of any two numbers", () => {
    const pairs = [[1, 1], [1, 100], [-1, 100], [0, 100]];
    const answers = [0, 1, 99, 0];
    expect(pairs.length).toEqual(answers.length);
    for (let i = 0; i < pairs.length; ++i) {
      expect(modulo(pairs[i][0], pairs[i][1])).toEqual(answers[i]);
    }
  });
});
