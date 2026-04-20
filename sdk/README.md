# ErrorSnap SDK

The **ErrorSnap SDK** allows you to easily integrate ErrorSnap error tracking into your web application. Once integrated, your app will start sending error reports to the ErrorSnap platform for analysis, tracking, and resolution.

## 🚀 Instruction

- Copy the project id which you want to track error
- in your project **index.html** put this script
  `

```html
<script>
  window.addEventListener('load', () => {
    const script = document.createElement('script');
    script.src = "https://errorsnap-sdk.netlify.app/";
    script.onload = () => {
      const app = new ErrorSnap({
        projectId: "your-project-id", // Replace with your actual project ID
        apiKey: "your-project-api-key", // Generate this in Project Settings > Integration
        environment: "production", // development | staging | production
      });
      app.initialize();
    };
    document.body.appendChild(script);
  });
</script>
```

The SDK now sends the API key with each error report so the backend can authenticate and rate limit per project key.

`environment` is optional. If omitted, the SDK defaults to `production`.

The SDK also records a session start event on initialization for usage analytics.

And you are good to go :)

For testing purposes, I created a [demo page](https://error-snap-test.netlify.app/), where you can just put your project ID and test your errors.
