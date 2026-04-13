# Errorsnap dashboard
## 🚀 Overview  
**ErrorSnap** is a comprehensive error management solution for web applications. It allows teams to detect, track, and resolve errors efficiently. Built for developers and project teams, ErrorSnap ensures seamless error monitoring, assignment, and resolution with real-time Slack notifications. 

## Images
<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/9262a7c8-b556-4020-9b00-a338bedc5d7e" />

![image](https://github.com/user-attachments/assets/00bb2b92-3c06-44c7-ae60-26bb6c3c1758)
![image](https://github.com/user-attachments/assets/5b745080-dddb-4cf9-b457-e8b81dcef9a7)
![image](https://github.com/user-attachments/assets/c9ca9498-3b68-4eed-95ca-606fb00879cf)

<img width="1919" height="911" alt="image" src="https://github.com/user-attachments/assets/cb9bcc28-e738-4287-8617-0fa985d8a4c5" />

![image](https://github.com/user-attachments/assets/6e0ab621-1d0a-4495-a1cc-c3055627aaf7)


## 🛠️ Features  
- **User Management**:  
  - Login and register users.  
- **Project Management**:  
  - Add or delete projects.  
  - View errors by each project.
- **Error Tracking**:  
  - Display project errors.
  - Search and filter errors using various criteria.  
  - Detailed error views include stack trace, file info, error line/col no, and browser/OS info for each error.
  - See screenshot of the error page
  - **Track original error lines using source maps**, enabling production apps (like React) to see the exact error location in the source code.
- **Team Collaboration**:  
  - Add team members to projects.  
  - Assign errors to specific team members for resolution.  
- **Slack Integration**:
  - Receive real-time messages for errors via Slack integration.

## 🛠️ Tech Stack
- React.js
- Typescript
- Iconify
- Material-UI
- React hook form
- Zod
- Tanstack Query
- Redux toolkit

## Usage
### 1. **Create a Project**
   - Sign up / log in and create a project on the [**ErrorSnap**](https://errorsnap.netlify.app) platform.
   - Create a new project.

### 2. **Copy Project ID**
   - Click on your created project and copy your project ID.

### 3. **Connect the SDK**
   - To integrate **ErrorSnap** with your web application, you need to include the **ErrorSnap SDK** in your project. [SDK Integration Guide](https://github.com/asifurrahaman754/error-snap/blob/main/sdk/README.md)

### 4 **Upload Source Maps (Optional but Recommended)**  
   - Install the [**ErrorSnap cli**](https://www.npmjs.com/package/errorsnap-cli) npm package in your project. Use it to automatically upload your source maps, so production apps (like React) can show the original error lines in your dashboard.

     Add the following script to your `package.json` to upload source maps after build:  
     ```json
     "scripts": {
       "postbuild": "errorsnap-upload -p <project_id> -d <dist folder>"
     }
     ```

### 4. **Extra - Slack Integration (Recommended)**
   - We recommend setting up **Slack Integration** to get real-time notifications about errors. This will allow your team to receive instant notifications whenever an error occurs in your project


## Future improvements
- export errors as CSV file
- Show the error function/code pointer
- Supports browsers like uc, brave, opera
