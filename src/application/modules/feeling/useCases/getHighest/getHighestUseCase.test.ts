import { IFeelingQueryService } from "../../serviceContracts/queryServices/IFeelingQueryService";
import TextFeelingService from "../../serviceContracts/textFeeling/TextFeelingService";
import resources, { resourceKeys } from "../../../../shared/locals/index";
import * as resultCodes from "../../../../shared/result/resultCodes.json";
import { textFeelingResponse } from "../../../../mocks/textFeeling.mock";
import { Sentence } from "../../../../../domain/sentence/Sentence";
import { UseCaseGetHighestFeelingSentence } from "./index";
import { textDto } from "../../../../mocks/textDto.mock";
import { mock } from "jest-mock-extended";

const defaultLanguage = "en";
const textFeelingQueryServiceMock = mock<IFeelingQueryService>();
const textFeelingService = new TextFeelingService(textFeelingQueryServiceMock);
const getHighestFeelingUseCase = new UseCaseGetHighestFeelingSentence(textFeelingService);

describe("when try to get a highest feeling sentence for text", () => {
  beforeAll(() => {
    resources.SetDefaultLanguage(defaultLanguage);
  });
  beforeEach(() => {
    textFeelingQueryServiceMock.AnalyzeText.mockReset();
  });
  it("should return a 400 error if dto is null", async () => {
    const result = await getHighestFeelingUseCase.Execute(null);
    expect(result.statusCode).toBe(resultCodes.BAD_REQUEST);
    expect(result.error).toBe(
      resources.GetWithParams(resourceKeys.SOME_PARAMETERS_ARE_MISSING, {
        missingParams: "textDto, text",
      }),
    );
    expect(result.success).toBeFalsy();
  });
  it("should return a 400 error if text in dto is null", async () => {
    const result = await getHighestFeelingUseCase.Execute({ text: null });
    expect(result.statusCode).toBe(resultCodes.BAD_REQUEST);
    expect(result.error).toBe(
      resources.GetWithParams(resourceKeys.SOME_PARAMETERS_ARE_MISSING, {
        missingParams: "text",
      }),
    );
    expect(result.success).toBeFalsy();
  });
  it("should return a 500 error if feeling service fail", async () => {
    textFeelingQueryServiceMock.AnalyzeText.mockResolvedValue(null);
    const result = await getHighestFeelingUseCase.Execute(textDto);
    expect(result.statusCode).toBe(resultCodes.INTERNAL_SERVER_ERROR);
    expect(result.error).toBe(resources.Get(resourceKeys.TEXT_FEELING_SERVICE_ERROR));
    expect(result.success).toBeFalsy();
  });
  it("should return success if dto have data and feeling service work", async () => {
    textFeelingQueryServiceMock.AnalyzeText.mockResolvedValue(textFeelingResponse);
    const result = await getHighestFeelingUseCase.Execute(textDto);
    const sentence = result.data as Sentence;
    expect(result.statusCode).toBe(resultCodes.SUCCESS);
    expect(sentence.sentiment).not.toBeNull;
    expect(sentence.sentence).not.toBeNull;
    expect(result.success).toBeTruthy();
  });
});
