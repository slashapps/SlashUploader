<%@ Page Language="C#" ContentType="text/html" Debug="True" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Drawing" %>
<%@ Import Namespace="System.Drawing.Drawing2D" %>
<%
    Response.AppendHeader("Access-Control-Allow-Origin", "*");
    
    string FileFolder = "./uploads/";
    bool DoOverwriteFilename = false;
    bool SaveFileWithGuidFilename = false;

    string Method = Request["method"];
    string IframeGateway = Request["iframe_gateway"];
    string FileName = Request["file_name"];
    string RequestId = Request["request_id"];
    string ChunkIndex = Request["chunk_index"];
    string Rotation = Request["rotation"];
    
    try {
        
        int RotationInt = 0;
		
		// TODO: Make each endpoint into a function.
		
        if (Method == "combine_chunks") {

            int.TryParse(Rotation, out RotationInt);
            NameValueCollection CombinedFile = CombineFileChunks (FileName, FileFolder, RequestId, RotationInt, DoOverwriteFilename, SaveFileWithGuidFilename);
            string FileDataJson = GetFileJson(CombinedFile);
            Response.Write (GetJsonResponse(FileDataJson));

        } else if (Method == "upload_chunk") {

            string Folder = UploadFileChunk(FileName, FileFolder, RequestId, ChunkIndex);
            Response.Write (GetJsonResponse(@"{""success"": ""1""}"));

        } else if (Method == "upload_through_iframe") {

            string FilesReturnStr = "";
            string[] Rotations = null;
            if (!string.IsNullOrEmpty(Rotation))
            {
                Rotations = Rotation.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);
            }
            for (int i=0; i<Request.Files.Count; i++) {
                RotationInt = 0;
                if (Rotations != null && Rotations.Length > i)
                {
                    int.TryParse(Rotations[i], out RotationInt);
                }
                NameValueCollection UploadedResult = UploadPostedFile (FileName, FileFolder, i, RotationInt, DoOverwriteFilename, SaveFileWithGuidFilename);
                string FileDataJson = GetFileJson(UploadedResult);
                FilesReturnStr += FileDataJson;
                if (i < Request.Files.Count-1) {
                    FilesReturnStr += ",";
                }
            }

            string ResponseStr = GetIframeResponse(IframeGateway, RequestId, FilesReturnStr);
            Response.Write (ResponseStr);

        } else if (Method == "upload_stream") {

            int.TryParse(Rotation, out RotationInt);
            NameValueCollection UploadedResult = SaveFileFromStreamData (FileName, FileFolder, RotationInt, DoOverwriteFilename, SaveFileWithGuidFilename);
            string FileDataJson = GetFileJson(UploadedResult);
            Response.Write (GetJsonResponse(FileDataJson));

        }

    } catch (Exception e) {
        string ErrorJson = GetErrorJson(e);
        string ResponseStr = "";
        if (Method == "upload_through_iframe")
        {
            ResponseStr = GetIframeResponse(IframeGateway, RequestId, ErrorJson);
        } else
        {
            ResponseStr = GetJsonResponse(ErrorJson);
        }
        Response.Write (ResponseStr);
    }

%>

<script runat="server">

    public static string GetJsonResponse (string FileDataJson) {

        string ReturnStr = "";
        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        string JsonCallback = "";
        if (PageApp.Request["callback"] != null && PageApp.Request["callback"] != "") {
            JsonCallback = PageApp.Request["callback"];
        }
        if (PageApp.Request["jsoncallback"] != null && PageApp.Request["jsoncallback"] != "") {
            JsonCallback = PageApp.Request["jsoncallback"];
        }
        if (JsonCallback != null && JsonCallback != "") {
            ReturnStr += JsonCallback+"(";
        }
        if (!string.IsNullOrEmpty(FileDataJson)) {
            ReturnStr += "["+FileDataJson+"]";
        }
        if (JsonCallback != null && JsonCallback != "") {
            ReturnStr += ")";
        }
        return ReturnStr;

    }

    public static string GetIframeResponse (string IframeGateway, string RequestId, string DataJson) {

        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        //string ReturnStr = "<html><body><iframe src='" + IframeGateway + "?request_id=" + RequestId + "&data=[" + PageApp.Server.UrlEncode(DataJson) + "]' id='gateway_iframe' style='width: 1px; height: 1px; opacity: 0; display: none;'></iframe></body></html>";
        string ReturnStr = "<html><body><iframe src='" + IframeGateway + "?request_id=" + RequestId + "&data=" + PageApp.Server.UrlEncode("["+DataJson+"]") + "' id='gateway_iframe' style='width: 1px; height: 1px; opacity: 0; display: none;'></iframe></body></html>"; // TODO: Try it
        return ReturnStr;

    }

    public static string GetFileJson (NameValueCollection FileObject) {

        string FileJson = @"{
			""file_name"": """+FileObject["file_name"]+@""",
			""file_path"": """+FileObject["file_path"]+@""",
			""error"": """+FileObject["error"]+@"""
			}";
        return FileJson;

    }

    public static string GetErrorJson (Exception Exp) {

        string FileJson = @"{
			""file_name"": """",
			""file_path"": """",
			""error"": """+ParseJsonStringValue(Exp.Message+" "+Exp.StackTrace)+@"""
			}";
        return FileJson;

    }

    public static string UploadFileChunk (string FileName, string FileFolder, string RequestId, string ChunkIndex) {

        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        string FolderName = "temp_"+FileName+"_"+RequestId;
        if (!Directory.Exists(PageApp.Server.MapPath(FileFolder+FolderName+"/"))) {
            Directory.CreateDirectory(PageApp.Server.MapPath(FileFolder+FolderName+"/"));
        }
        string FilePath = PageApp.Server.MapPath(FileFolder+FolderName+"/");
        int ChunkIndexInt = 0;
        int.TryParse (ChunkIndex, out ChunkIndexInt);
        string ChunkIndexStr = ChunkIndexInt.ToString();
        while (ChunkIndexStr.Length < 40) {
            ChunkIndexStr = "0"+ChunkIndexStr;
        }
        string NewFilePath = Path.Combine(FilePath, ChunkIndexStr);
        /*
         * This code is slower
        using (System.IO.FileStream Fs = System.IO.File.Create(NewFilePath)) {
            byte[] Bytes = new byte[77570];
            int BytesRead;
            while ((BytesRead = PageApp.Request.InputStream.Read(Bytes, 0, Bytes.Length)) > 0) {
                Fs.Write(Bytes, 0, BytesRead);
            }
        }
        */
        byte[] FileData = PageApp.Request.BinaryRead(PageApp.Request.TotalBytes);
        File.Create(NewFilePath).Close();
        File.WriteAllBytes(NewFilePath, FileData);

        return FolderName;

    }

    public static NameValueCollection CombineFileChunks (string FileName, string FileFolder, string RequestId, int Rotation, bool DoOverwrite, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        string FolderName = "temp_"+FileName+"_"+RequestId;
        string FilePath = PageApp.Server.MapPath(FileFolder+FolderName+"/");
        string FileNameToSave = ParseFileName(FileName, FileFolder, DoOverwrite, SaveFileWithGuidFilename);
        string NewFilePath = Path.Combine(PageApp.Server.MapPath(FileFolder), FileNameToSave);
        string[] FilePaths = Directory.GetFiles(FilePath);
        foreach (string Item in FilePaths) {
            MergeFileChunks(NewFilePath, Item);
        }
        if (Rotation > 0)
        {
            RotateImage(FileNameToSave, FileFolder, FileNameToSave, FileFolder, Rotation);
        }
        Directory.Delete (PageApp.Server.MapPath(FileFolder+FolderName+"/"));
        NameValueCollection ReturnObj = new NameValueCollection();
        ReturnObj["file_name"] = FileNameToSave;
        ReturnObj["file_path"] = GetFileUrl (FileNameToSave, FileFolder);
        return ReturnObj;

    }

    private static void MergeFileChunks (string File1, string File2)
    {
        FileStream Fs1 = null;
        FileStream Fs2 = null;
        try {
            Fs1 = System.IO.File.Open(File1, FileMode.Append);
            Fs2 = System.IO.File.Open(File2, FileMode.Open);
            byte[] Fs2Content = new byte[Fs2.Length];
            Fs2.Read(Fs2Content, 0, (int)Fs2.Length);
            Fs1.Write(Fs2Content, 0, (int)Fs2.Length);
        } catch (Exception ex) {
            //Console.WriteLine(ex.Message + " : " + ex.StackTrace);
        } finally {
            Fs1.Close();
            Fs2.Close();
            System.IO.File.Delete(File2);
        }
    }

    private static NameValueCollection SaveFileFromStreamData (string FileName, string FileFolder, int Rotation, bool DoOverwrite, bool SaveFileWithGuidFilename) {

        NameValueCollection ReturnObj = new NameValueCollection();
        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        FileName = ParseFileName(FileName, FileFolder, DoOverwrite, SaveFileWithGuidFilename);
        byte[] FileData = PageApp.Request.BinaryRead(PageApp.Request.TotalBytes);

        if (FileData.Length > 0) {

            string Extension = GetFileExtension(FileName).ToLower();
            if (Extension == "jpg" || Extension == "png" || Extension == "jpeg" || Extension == "bmp") {

                MemoryStream Ms = new MemoryStream(FileData);
                Bitmap Bmp = new Bitmap((Bitmap)System.Drawing.Image.FromStream(Ms, true, false));
                Bmp.Save(PageApp.Server.MapPath(FileFolder)+FileName);
                Ms.Close();
                Bmp.Dispose();
                if (Rotation != 0)
                {
                    RotateImage(FileName, FileFolder, FileName, FileFolder, Rotation);
                }

            } else {
                File.WriteAllBytes(PageApp.Server.MapPath(FileFolder)+FileName, FileData);
            }
            ReturnObj["file_name"] = FileName;
            ReturnObj["file_path"] = GetFileUrl (FileName, FileFolder);

        } else {
            ReturnObj["error"] = "No stream data";
        }

        return ReturnObj;
    }

    private static NameValueCollection UploadPostedFile (string FileName, string FileFolder, int FileIndex, int Rotation, bool DoOverwrite, bool SaveFileWithGuidFilename) {

        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        HttpFileCollection Files = PageApp.Request.Files;
        NameValueCollection ReturnObj = new NameValueCollection();

        if (Files.Count > FileIndex) {

            HttpPostedFile postedFile = Files[FileIndex];
            if (String.IsNullOrEmpty(FileName)) {
                FileName = postedFile.FileName;
            }
            FileName = ParseFileName(FileName, FileFolder, DoOverwrite, SaveFileWithGuidFilename);
            string SaveLocation = PageApp.Server.MapPath(FileFolder)+FileName;
            postedFile.SaveAs(SaveLocation);
            if (Rotation > 0)
            {
                RotateImage(FileName, FileFolder, FileName, FileFolder, Rotation);
            }
            ReturnObj["file_name"] = FileName;
            ReturnObj["file_path"] = GetFileUrl (FileName, FileFolder);

        }else{
            ReturnObj["error"] = "File was not found";
        }
        return ReturnObj;
    }

    private static string ParseFileName (string FileName, string FileFolder, bool DoOverwrite, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        if (!Directory.Exists(PageApp.Server.MapPath(FileFolder))) {
            Directory.CreateDirectory(PageApp.Server.MapPath(FileFolder));
        }
        if (SaveFileWithGuidFilename)
        {
            string Extension = "";
            if (FileName.LastIndexOf(".") != -1) {
                Extension = FileName.Substring(FileName.LastIndexOf("."), FileName.Length-FileName.LastIndexOf("."));
            }
            FileName = GetGuid();
            if (!string.IsNullOrEmpty(Extension))
            {
                FileName += Extension;
            }
        }
        FileName = FileName.Replace("/", "")
            .Replace("\\", "")
            .Replace(":", "")
            .Replace("'", "")
            .Replace("+", "")
            .Replace("%", "")
            .Replace("#", "")
            .Replace(" ", "_");

        string FilesNumberingType = "parenthesis";
        if (PageApp.Request.Browser.Type.ToUpper().Contains("IE"))
        {
            if (PageApp.Request.Browser.MajorVersion <= 9)
            {
                FileName = FileName
                    .Replace("(", "-")
                    .Replace(")", "-");
                FilesNumberingType = "underline";
            }
        }

        if (string.IsNullOrEmpty(FileName)) {
            FileName = GetGuid();
        }
        if (!DoOverwrite) {
            FileName = GetNonOverwrittenFileName (FileName, FileFolder, FilesNumberingType);
        }
        return FileName;

    }

    public static string GetFilePath (string Filename, string FileDir) {
        System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
        if (PageApp == null) {
            return FileDir+Filename;
        } else {
            return PageApp.Server.MapPath(FileDir)+Filename;
        }
    }

    public static string GetNonOverwrittenFileName (string FileName, string FileFolder, string FilesNumberingType) {

        try {

            string Extension = "";
            string CurFileName = FileName;
            if (FileName.LastIndexOf(".") != -1) {
                Extension = FileName.Substring(FileName.LastIndexOf("."), FileName.Length-FileName.LastIndexOf("."));
                CurFileName = FileName.Substring(0, FileName.LastIndexOf("."));
            }
            int CurNum = 0;
            while (System.IO.File.Exists(GetFilePath (FileName, FileFolder))) {
                CurNum ++;
                if (FilesNumberingType == "parenthesis")
                {
                    FileName = CurFileName+"("+Convert.ToString(CurNum)+")"+Extension;
                } else
                {
                    FileName = CurFileName+"_"+Convert.ToString(CurNum)+Extension;
                }
            }

        }catch(Exception e) {
        }
        return FileName;

    }

    public static string GetFileExtension (string FileName) {

        if (FileName != null) {
            if (FileName.LastIndexOf(".") != -1) {
                string ReturnStr = FileName.Substring(FileName.LastIndexOf(".")+1, FileName.Length-FileName.LastIndexOf(".")-1);
                return ReturnStr.ToLower();
            }else{
                return "";
            }
        } else {
            return "";
        }

    }

    public static System.Drawing.Imaging.ImageFormat GetImageFormatByFileExtension (string FileName) {
        try {
            System.Drawing.Imaging.ImageFormat ImgFormat = System.Drawing.Imaging.ImageFormat.Png;
            string Extens = GetFileExtension(FileName);
            if (Extens == "jpg" || Extens == "jpeg") {
                ImgFormat = System.Drawing.Imaging.ImageFormat.Jpeg;
            } else if (Extens == "bmp") {
                ImgFormat = System.Drawing.Imaging.ImageFormat.Bmp;
            }
            return ImgFormat;
        }catch(Exception e) {
        }
        return null;
    }

    private static void RotateImage (string FileToRotateName, string FileToRotateFolder, string NewFileName, string NewFileFolder, int Rotation) {
        try {

            System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
            NewFileName = ParseFileName(NewFileName, NewFileFolder, true, false);
            string DestanationImg = PageApp.Server.MapPath(NewFileFolder+NewFileName);
            System.Drawing.Image Image = System.Drawing.Image.FromFile(PageApp.Server.MapPath(FileToRotateFolder)+Convert.ToString(FileToRotateName));

            GraphicsPath Path = new GraphicsPath();
            Path.AddRectangle(new RectangleF(0f, 0f, Image.Width, Image.Height));
            Matrix Mtrx = new Matrix();
            Mtrx.Rotate(Rotation);
            RectangleF Rct = Path.GetBounds(Mtrx);

            Bitmap Bmp = new Bitmap(Convert.ToInt32(Rct.Width), Convert.ToInt32(Rct.Height));

            System.Drawing.Graphics Gr = System.Drawing.Graphics.FromImage(Bmp);
            Gr.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
            Gr.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
            Gr.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;

            Gr.TranslateTransform(-Rct.X, -Rct.Y);
            Gr.RotateTransform(Rotation);

            System.Drawing.Rectangle RectDestination = new System.Drawing.Rectangle(0, 0, Convert.ToInt32(Gr.VisibleClipBounds.Width), Convert.ToInt32(Gr.VisibleClipBounds.Height));
            Gr.DrawImage(Image, RectDestination, 0, 0, Convert.ToInt32(Gr.VisibleClipBounds.Width), Convert.ToInt32(Gr.VisibleClipBounds.Height), GraphicsUnit.Pixel);

            Image.Dispose();
            if (System.IO.File.Exists(DestanationImg)){
                System.IO.File.Delete(DestanationImg);
            }
            Bmp.Save(DestanationImg, GetImageFormatByFileExtension (NewFileName));
            Bmp.Dispose();

        } catch (Exception e) {
        }
    }

    public static string GetFileUrl (string FileName, string fileDir) {
        try {
            System.Web.HttpContext PageApp = System.Web.HttpContext.Current;
            if (PageApp == null) {
                return null;
            }
            string Str = "//"+PageApp.Request.ServerVariables["SERVER_NAME"]+(new System.Web.UI.Control()).ResolveUrl(fileDir)+FileName;
            return Str;
        }catch(Exception) {
        }
        return null;
    }

    private static string ParseJsonStringValue (string Str) {

        Str = Str.Replace(Convert.ToString(Convert.ToChar(8232)), "\n");
        Str = Str.Replace(Convert.ToString(Convert.ToChar(8233)), "\n");
        Str = System.Web.HttpUtility.JavaScriptStringEncode(Str);
        return Str;

    }

    public static string GetGuid () {
        return (Guid.NewGuid().ToString());
    }

</script>