import type {NextPage} from "next";
import type React from "react";
import {useRouter} from "next/router";
import {Form, FormControl} from "react-bootstrap";
import styles from "@/styles/Entry.module.css";
import {useEffect, useState} from "react";
import WithList from "@/components/WithList";

const Home: NextPage = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});

  function goBookshelves(url: string) {
    router.push(`/bookshelves/${encodeURIComponent(url)}`);
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    goBookshelves(event.currentTarget.url.value);
  };
  const handleClick = (url: string) => {
    goBookshelves(url);
  };

  useEffect(() => {
    setCampaigns(loadCampaigns());
  }, []);

  return (
    <div className={styles.container}>
      <Form onSubmit={handleSubmit}>
        <WithList items={campaigns} onClick={handleClick}>
          <FormControl
            name="url"
            type="url"
            placeholder="Enter url"
            defaultValue=""
            onKeyDown={(event) => {
              if (event.code == "Enter") {
                event.preventDefault();

                goBookshelves(event.currentTarget.value);
              }
            }}
          />
        </WithList>
      </Form>
    </div>
  );
};

export default Home;

export function loadCampaigns(): Record<string, string> {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith("http"));
  const campaigns: Record<string, string> = {};

  if (keys.length > 0) {
    for (const key of keys) {
      const campaign = JSON.parse(localStorage.getItem(key)!);
      campaigns[campaign.url] = campaign.title;
    }
  } else {
    const defaults = Object.entries({
      "https://www.amazon.co.jp/s?rh=n%3A8486051051&fs=true": "期間限定無料",
      "https://www.amazon.co.jp/s?rh=n%3A8138289051&fs=true": "無料",
      "https://www.amazon.co.jp/s?rh=n%3A7962654051&fs=true": "セール",
    });
    for (const [url, title] of defaults) {
      localStorage.setItem(
        url,
        JSON.stringify({
          title,
          url,
          books: [],
          updatedAt: Date.now(),
        })
      );

      campaigns[url] = title;
    }
  }

  return campaigns;
}
