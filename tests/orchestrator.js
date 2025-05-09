import retry from "async-retry";

export default async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
      onRetry: (error, attempt) => {
        console.log(`Attempt ${attempt}, with error ${error}`);
      },
    });

    async function fetchStatusPage() {
      try {
        const response = await fetch("http://localhost:3000/api/v1/status");
        if (response.status !== 200) {
          throw new Error(`Failed to fetch, HTTP Status ${response.status}`);
        }
      } catch (error) {
        throw error;
      }
    }
  }
}
