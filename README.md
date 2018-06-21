Installation
------------
Step 1: Angular 6 will work node 8 and above, Install node version 8

Step 2: Update your Angular CLI globally and locally, and migrate the configuration to the new angular.json format by running the following:
a) If already installed -> ng update @angular/cli
b) If not installed -> npm install -g @angular/cli

Step 3 : Download the ILI project from github and navigate to the project directory and give the below mentioned command.
         npm install

Step 4: Build the angular server 
        ng build --watch

Step 5: After build the angular server run the express by below mentioned command
        set DEBUG=ili:* & npm start

Note: In node_modules/malihu-custom-scrollbar-plugin replace css with our custom worked css jquery.mCustomScrollbar.css....

Image upload
-------------
Download and install GraphicsMagick or ImageMagick for GM module which is used to resize and crop the image upload.