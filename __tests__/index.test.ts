import {faker} from "@faker-js/faker";
import {loadCampaigns} from "@/pages/index";

describe(loadCampaigns, () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("when not stored in local storage", () => {
    const actual = loadCampaigns();
    expect(actual).toStrictEqual({
      "https://www.amazon.co.jp/s?rh=n%3A8486051051&fs=true": "期間限定無料",
      "https://www.amazon.co.jp/s?rh=n%3A8138289051&fs=true": "無料",
      "https://www.amazon.co.jp/s?rh=n%3A7962654051&fs=true": "セール",
    });
  });
  it("when stored in local storage", () => {
    const campaign = {
      title: faker.company.buzzPhrase(),
      url: faker.internet.url(),
      books: [],
      updatedAt: Date.now(),
    };
    localStorage.setItem(campaign.url, JSON.stringify(campaign));

    const actual = loadCampaigns();
    expect(actual).toStrictEqual({
      [campaign.url]: campaign.title,
    });
  });
});
