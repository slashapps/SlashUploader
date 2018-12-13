# Server Script

## Web.config

Current web.config files allows to upload big files.
In order for the web.config file to take effect - folder must be Application Pool on server, or web.config file should be located on current Application Pool root.

## Uploads Folder

Folder to store user's uploaded files.
Make sure to give "uploads" folder on your server read & write permissions.

## Security

Example code limits file types based on file extenstion.
However, it is highly recomanded to use AntiVirus software on your server - allowing users to upload files and view them represent a significant security risk.
Make sure to secure your Application and server with all means necessary.
More information here: https://www.owasp.org/index.php/Unrestricted_File_Upload.
