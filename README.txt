To implement the face recognition attendance system, two folders are needed: one for the server-side and one for the client-side. 

---------------------------------------------------------------------------------------------
If you want the mongoUrl to connect to your own database, you can follow these steps:
 
1. Sign up and log in to your MongoDB account at https://account.mongodb.com/account/login?signedOut=true.
3. Create a new database.
Build your cluster.
3. Create your cluster and fill in your username and password on the Security QuickStart page.
4. Add your IP address as 0.0.0.0/0 and click "Add Entry."
5. Click "Finish" and Close".
6. Click "Connect" on the database deployments page.
7. Click "Drivers" and then copy the URL under "Add your connection string into your application code."
8. Paste the copied URL to the mongoUrl variable in the app.js file located in the "server-side" folder.
9. Replace the "<password>" in the mongoUrl with the actual password.
---------------------------------------------------------------------------------------------

If you choose to use the original database specified in the file, you can skip the steps outlined above, but you will not be able to view the database activity.

1. Open two windows in your editor.
2. One window should be for the server-side folder and the other for the client-side folder.
3. Open the terminal for both windows.
4. In the terminal for the client-side and server-side window, type "npm install." 
5. In the terminal for the client-side window, type "npm start." 
6. In the terminal for the server-side window, type "nodemon app"

---------------------------------------------------------------------------------------------
