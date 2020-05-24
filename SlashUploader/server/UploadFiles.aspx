<%@ Page Language="C#" ContentType="text/html" Debug="True" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Drawing" %>
<%@ Import Namespace="System.Drawing.Drawing2D" %>
<%@ Import Namespace="System.Security.AccessControl" %>
<%@ Import Namespace="System.Security.Principal" %>
<%

/*
 * SlashUploader - JS plugin - Version 1.5.8
 * http://slashuploader.com/
 * Copyright (c) 2018-present Slash Apps Development, http://slash.co.il/
 * Licensed under the MIT License [https://en.wikipedia.org/wiki/MIT_License]
*/

Response.AppendHeader("Access-Control-Allow-Origin", "*");

string FileFolder = "./uploads/";
bool DoOverwriteFilename = false;
bool SaveFileWithGuidFilename = false;
String[] AllowedFilesTypes = {
    "jpg", "png", "gif", "jpeg", "bmp", "tiff", "webp", "jfif", // Images
    "3gp2", "3gpp", "3gpp2", "asf", "asx", "avi", "flv", "m4v", "mkv", "mov", "mpeg", "mpg", "mpe", "m1s", "mpa", "mp2", "m2a", "mp2v", "m2v", "m2s", "mp4", "ogg", "rm", "wmv", "mp4", "qt", "ogm", "vob", "webm", "787", // Videos
    "3gp", "act", "aiff", "aac", "alac", "amr", "atrac", "au", "awb", "dct", "dss", "dvf", "flac", "gsm", "iklax", "ivs", "m4a", "m4p", "mmf", "mp3", "mpc", "msv", "ogg", "opus", "raw", "tta", "vox", "wav", "wma", // Audios
    "txt", // plain Text
    "doc", "docb", "docm", "docx", "dot", "dotm", "dotx", "pdf", "pot", "potm", "potx", "ppam", "pps", "ppsx", "ppt", "pptm", "pptx", "sldm", "sldx", // Docs
    "csv", "xla", "xlam", "xll", "xlm", "xls","xlsb", "xslm", "xlsx", "xlt", "xltm", "xltx", "xlw" // Excel
};

StartUpload(FileFolder, DoOverwriteFilename, SaveFileWithGuidFilename, AllowedFilesTypes);
%>
<script runat="server">

    public static string MethodParamName = "upload_method";
    public static string RequestIdParamName = "request_id";
    public static string ChunkIndexParamName = "chunk_index";
    public static string TotalChunksParamName = "total_chunks";
    public static string IframeGatewayparamName = "iframe_gateway";
    public static string FileNameParamName = "file_name";
    public static string FileRotationParamName = "rotation";

    public static string ReturnFileNameParamName = "file_name";
    public static string ReturnFilePathParamName = "file_path";
    public static string ReturnErrorParamName = "error";

    public static string ResizeTypeParamName = "resize_type";
    public static string ResizeOutputWidthParamName = "resize_output_width";
    public static string ResizeOutputHeightParamName = "resize_output_height";


    //
    //
    //  Main Function
    //

    public static void StartUpload(string FileFolder, bool DoOverwriteFilename, bool SaveFileWithGuidFilename, String[] AllowedFilesTypes)
    {
        try {

            string GeneralError = GetGeneralError(FileFolder, AllowedFilesTypes);
            if (!string.IsNullOrEmpty(GeneralError)) {
                ResponseError(GeneralError);
            }
            else {
                System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
                string Method = PageInstance.Request[MethodParamName];
                if (Method == "upload_chunk") {
                    UploadChunk(FileFolder, DoOverwriteFilename, SaveFileWithGuidFilename);
                } else if (Method == "upload_through_iframe") {
                    UploadThroughIframe(FileFolder, DoOverwriteFilename, SaveFileWithGuidFilename);
                } else if (Method == "upload_stream") {
                    UploadStream(FileFolder, DoOverwriteFilename, SaveFileWithGuidFilename);
                }
            }

        } catch (Exception e) {
            ResponseError(e);
        }
    }

    //
    //
    //  Endpoints
    //

    public static void CombineChunks(string FileFolder, bool DoOverwriteFilename, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string Rotation = PageInstance.Request[FileRotationParamName];
        string FileName = PageInstance.Request[FileNameParamName];
        string RequestId = PageInstance.Request[RequestIdParamName];
        int RotationInt = 0;
        int.TryParse(Rotation, out RotationInt);
        NameValueCollection CombinedFile = CombineFileChunks(FileName, FileFolder, RequestId, RotationInt, DoOverwriteFilename, SaveFileWithGuidFilename);
        CombinedFile = ProcessUploadedFile(FileFolder, CombinedFile);
        string FileDataJson = GetFileJson(CombinedFile);
        PageInstance.Response.Write(GetJsonResponse(FileDataJson));
    }

    public static void UploadChunk(string FileFolder, bool DoOverwriteFilename, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string FileName = PageInstance.Request[FileNameParamName];
        string RequestId = PageInstance.Request[RequestIdParamName];
        string ChunkIndex = PageInstance.Request[ChunkIndexParamName];
        string TotalChunks = PageInstance.Request[TotalChunksParamName];

        int ChunkIndexInt = -1;
        int.TryParse(ChunkIndex, out ChunkIndexInt);
        int TotalChunksInt = -1;
        int.TryParse(TotalChunks, out TotalChunksInt);
        if (ChunkIndexInt >= 0 && TotalChunksInt > 0) {
            string Folder = UploadFileChunk(FileName, FileFolder, RequestId, ChunkIndex);
            if (ChunkIndexInt + 1 == TotalChunksInt) {
                CombineChunks(FileFolder, DoOverwriteFilename, SaveFileWithGuidFilename);
            } else {
                PageInstance.Response.Write(GetJsonResponse(@"{""success"": ""1""}"));
            }
        }
    }

    public static void UploadThroughIframe(string FileFolder, bool DoOverwriteFilename, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string Rotation = PageInstance.Request[FileRotationParamName];
        string FileName = PageInstance.Request[FileNameParamName];
        string IframeGateway = PageInstance.Request[IframeGatewayparamName];
        string RequestId = PageInstance.Request[RequestIdParamName];
        int RotationInt = 0;
        string FilesReturnStr = "";
        string[] Rotations = null;
        if (!string.IsNullOrEmpty(Rotation)) {
            Rotations = Rotation.Split(new string[] { "," }, StringSplitOptions.None);
        }
        for (int i = 0; i < PageInstance.Request.Files.Count; i++) {
            RotationInt = 0;
            if (Rotations != null && Rotations.Length > i) {
                int.TryParse(Rotations[i], out RotationInt);
            }
            NameValueCollection UploadedResult = UploadPostedFile(FileName, FileFolder, i, RotationInt, DoOverwriteFilename, SaveFileWithGuidFilename);
            UploadedResult = ProcessUploadedFile(FileFolder, UploadedResult);
            string FileDataJson = GetFileJson(UploadedResult);
            FilesReturnStr += FileDataJson;
            if (i < PageInstance.Request.Files.Count - 1) {
                FilesReturnStr += ",";
            }
        }
        string ResponseStr = GetIframeResponse(IframeGateway, RequestId, FilesReturnStr);
        PageInstance.Response.Write(ResponseStr);
    }

    public static void UploadStream(string FileFolder, bool DoOverwriteFilename, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string Rotation = PageInstance.Request[FileRotationParamName];
        string FileName = PageInstance.Request[FileNameParamName];
        int RotationInt = 0;
        int.TryParse(Rotation, out RotationInt);
        NameValueCollection UploadedResult = SaveFileFromStreamData(FileName, FileFolder, RotationInt, DoOverwriteFilename, SaveFileWithGuidFilename);
        UploadedResult = ProcessUploadedFile(FileFolder, UploadedResult);
        string FileDataJson = GetFileJson(UploadedResult);
        PageInstance.Response.Write(GetJsonResponse(FileDataJson));
    }

    public static bool ValidateFilesTypes(String[] AllowedFilesTypes)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string FileName = PageInstance.Request[FileNameParamName];
        bool FileTypeIsValid = true;
        if (!string.IsNullOrEmpty(FileName) && !IsFileTypeValid(FileName, AllowedFilesTypes)) {
            FileTypeIsValid = false;
        }
        if (PageInstance.Request.Files != null) {
            for (int i = 0; i < PageInstance.Request.Files.Count; i++)
            {
                HttpPostedFile PostedFile = PageInstance.Request.Files[i];
                if (!IsFileTypeValid(PostedFile.FileName, AllowedFilesTypes)) {
                    FileTypeIsValid = false;
                }
            }
        }
        return FileTypeIsValid;
    }

    private static NameValueCollection ProcessUploadedFile(string FileFolder, NameValueCollection UploadedFile)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;

        ImageCropper Cropper = new ImageCropper();
        ImageCropper.ScaleMode.TryParse(PageInstance.Request[ResizeTypeParamName], out Cropper.ResizeType);
        if (Cropper.ResizeType != ImageCropper.ScaleMode.None) {
            Cropper.OutputWidth = Convert.ToInt32(PageInstance.Request[ResizeOutputWidthParamName]);
            Cropper.OutputHeight = Convert.ToInt32(PageInstance.Request[ResizeOutputHeightParamName]);
            Cropper.FileToCropPath = PageInstance.Server.MapPath(FileFolder + UploadedFile[ReturnFileNameParamName]);
            Cropper.NewFileToSavePath = PageInstance.Server.MapPath(FileFolder + UploadedFile[ReturnFileNameParamName]);
            string NewFileName = Cropper.Crop();

            NameValueCollection ReturnObj = new NameValueCollection();
            ReturnObj[ReturnFileNameParamName] = NewFileName;
            ReturnObj[ReturnFilePathParamName] = GetFileUrl(NewFileName, FileFolder);
            return ReturnObj;
        } else {
            return UploadedFile;
        }

    }

    //
    //
    //  Functions
    //

    public static string GetJsonResponse(string FileDataJson) {

        string ReturnStr = "";
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string JsonCallback = "";
        if (PageInstance.Request["callback"] != null && PageInstance.Request["callback"] != "") {
            JsonCallback = PageInstance.Request["callback"];
        }
        if (PageInstance.Request["jsoncallback"] != null && PageInstance.Request["jsoncallback"] != "") {
            JsonCallback = PageInstance.Request["jsoncallback"];
        }
        if (JsonCallback != null && JsonCallback != "") {
            ReturnStr += JsonCallback + "(";
        }
        if (!string.IsNullOrEmpty(FileDataJson)) {
            ReturnStr += "[" + FileDataJson + "]";
        }
        if (JsonCallback != null && JsonCallback != "") {
            ReturnStr += ")";
        }
        return ReturnStr;

    }

    public static string GetIframeResponse(string IframeGateway, string RequestId, string DataJson) {

        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string ReturnStr = "<html><body><iframe src='" + IframeGateway + "?" + RequestIdParamName + "=" + RequestId + "&data=" + PageInstance.Server.UrlEncode("[" + DataJson + "]") + "' id='gateway_iframe' style='width: 1px; height: 1px; opacity: 0; display: none;'></iframe></body></html>"; // TODO: Try it
        return ReturnStr;

    }

    public static string GetFileJson(NameValueCollection FileObject) {

        string FileJson = @"{
        """+ReturnFileNameParamName+@""": """+FileObject[ReturnFileNameParamName]+@""",
            """+ReturnFilePathParamName+@""": """+FileObject[ReturnFilePathParamName]+@""",
                """+ReturnErrorParamName+@""": """+FileObject[ReturnErrorParamName]+@"""
    } ";
    return FileJson;

    }

    public static string GetGeneralError(string FileFolder, String[] AllowedFilesTypes)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        if (!ValidateFilesTypes(AllowedFilesTypes)) {
            return "File type is not allowed. The only allowed file types to upload are images, media, plain text and documents.";
        }
        else if (!Directory.Exists(PageInstance.Server.MapPath(FileFolder))) {
            return "Directory '" + PageInstance.Server.MapPath(FileFolder) + "' doesn't exist.";
        }
        else if (!DirectoryHasWritePermission(PageInstance.Server.MapPath(FileFolder))) {
            return "Directory '" + PageInstance.Server.MapPath(FileFolder) + "' doesn't have write permissions.";
        }
        return null;
    }

    public static bool DirectoryHasWritePermission(string DirectoryPath)
    {
        var AllowWrite = false;
        var DenyWrite = false;
        var AccessControlList = Directory.GetAccessControl(DirectoryPath);
        if (AccessControlList == null) {
            return false;
        }
        var AccessRules = AccessControlList.GetAccessRules(true, true, typeof (System.Security.Principal.NTAccount));
        if (AccessRules == null) {
            return false;
        }
        WindowsIdentity CurrentUser = WindowsIdentity.GetCurrent();
        WindowsPrincipal Principal = new WindowsPrincipal(CurrentUser);
        foreach(FileSystemAccessRule CurRule in AccessRules)
        {
            NTAccount CurNtAccount = CurRule.IdentityReference as NTAccount;
            if (CurNtAccount != null && (CurRule.FileSystemRights & FileSystemRights.Write) > 0) {
                if (Principal.IsInRole(CurNtAccount.Value)) {
                    if (CurRule.AccessControlType == AccessControlType.Allow) {
                        AllowWrite = true;
                    }
                    else if (CurRule.AccessControlType == AccessControlType.Deny) {
                        DenyWrite = true;
                    }
                }
            }
        }

        return AllowWrite && !DenyWrite;
    }

    public static void ResponseError(Exception Exp)
    {
        ResponseError(Exp.Message + " " + Exp.StackTrace);
    }

    public static void ResponseError(string ErrorString)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        NameValueCollection ErrorResult = new NameValueCollection();
        ErrorResult[ReturnErrorParamName] = ParseJsonStringValue(ErrorString);
        string ErrorJson = GetFileJson(ErrorResult);
        string Method = PageInstance.Request[MethodParamName];
        if (Method == "upload_through_iframe") {
            string IframeGateway = PageInstance.Request[IframeGatewayparamName];
            string RequestId = PageInstance.Request[RequestIdParamName];
            PageInstance.Response.Write(GetIframeResponse(IframeGateway, RequestId, ErrorJson));
        } else {
            PageInstance.Response.Write(GetJsonResponse(ErrorJson));
        }
    }

    public static string UploadFileChunk(string FileName, string FileFolder, string RequestId, string ChunkIndex) {

        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string FolderName = "temp_" + FileName + "_" + RequestId;
        if (!Directory.Exists(PageInstance.Server.MapPath(FileFolder + FolderName + "/"))) {
            Directory.CreateDirectory(PageInstance.Server.MapPath(FileFolder + FolderName + "/"));
        }
        string FilePath = PageInstance.Server.MapPath(FileFolder + FolderName + "/");
        int ChunkIndexInt = 0;
        int.TryParse(ChunkIndex, out ChunkIndexInt);
        string ChunkIndexStr = ChunkIndexInt.ToString();
        while (ChunkIndexStr.Length < 40) {
            ChunkIndexStr = "0" + ChunkIndexStr;
        }
        string NewFilePath = Path.Combine(FilePath, ChunkIndexStr);
        /*
         * This code is slower
        using (System.IO.FileStream Fs = System.IO.File.Create(NewFilePath)) {
            byte[] Bytes = new byte[77570];
            int BytesRead;
            while ((BytesRead = PageInstance.Request.InputStream.Read(Bytes, 0, Bytes.Length)) > 0) {
                Fs.Write(Bytes, 0, BytesRead);
            }
        }
        */
        byte[] FileData = PageInstance.Request.BinaryRead(PageInstance.Request.TotalBytes);
        File.Create(NewFilePath).Close();
        File.WriteAllBytes(NewFilePath, FileData);

        return FolderName;

    }

    public static NameValueCollection CombineFileChunks(string FileName, string FileFolder, string RequestId, int Rotation, bool DoOverwrite, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        string FolderName = "temp_" + FileName + "_" + RequestId;
        string FilePath = PageInstance.Server.MapPath(FileFolder + FolderName + "/");
        string TempFileName = GetGuidFileName(FileName);
        string NewFilePath = Path.Combine(PageInstance.Server.MapPath(FileFolder), TempFileName);
        string[] FilePaths = Directory.GetFiles(FilePath);
        foreach(string Item in FilePaths) {
            MergeFileChunks(NewFilePath, Item);
        }
        if (Rotation > 0) {
            RotateImage(TempFileName, FileFolder, TempFileName, FileFolder, Rotation);
        }
        Directory.Delete(PageInstance.Server.MapPath(FileFolder + FolderName + "/"));
        string FileNameToSave = ParseFileName(FileName, FileFolder, DoOverwrite, SaveFileWithGuidFilename);
        System.IO.File.Move(PageInstance.Server.MapPath(FileFolder + TempFileName), PageInstance.Server.MapPath(FileFolder + FileNameToSave)); // Rename
        NameValueCollection ReturnObj = new NameValueCollection();
        ReturnObj[ReturnFileNameParamName] = FileNameToSave;
        ReturnObj[ReturnFilePathParamName] = GetFileUrl(FileNameToSave, FileFolder);
        return ReturnObj;

    }

    private static void MergeFileChunks(string File1, string File2)
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

    private static NameValueCollection SaveFileFromStreamData(string FileName, string FileFolder, int Rotation, bool DoOverwrite, bool SaveFileWithGuidFilename) {

        NameValueCollection ReturnObj = new NameValueCollection();
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        byte[] FileData = PageInstance.Request.BinaryRead(PageInstance.Request.TotalBytes);
        string TempFileName = GetGuidFileName(FileName);
        if (FileData.Length >= 0) {
            File.WriteAllBytes(PageInstance.Server.MapPath(FileFolder) + TempFileName, FileData);
            string Extension = GetFileExtension(FileName).ToLower();
            if ((Rotation != 0) && (Extension == "jpg" || Extension == "png" || Extension == "jpeg" || Extension == "bmp")) {
                RotateImage(TempFileName, FileFolder, TempFileName, FileFolder, Rotation);
            }
            string FileNameToSave = ParseFileName(FileName, FileFolder, DoOverwrite, SaveFileWithGuidFilename);
            System.IO.File.Move(PageInstance.Server.MapPath(FileFolder + TempFileName), PageInstance.Server.MapPath(FileFolder + FileNameToSave)); // Rename
            ReturnObj[ReturnFileNameParamName] = FileNameToSave;
            ReturnObj[ReturnFilePathParamName] = GetFileUrl(FileNameToSave, FileFolder);

        } else {
            ReturnObj[ReturnErrorParamName] = "No stream data";
        }

        return ReturnObj;
    }

    private static NameValueCollection UploadPostedFile(string FileName, string FileFolder, int FileIndex, int Rotation, bool DoOverwrite, bool SaveFileWithGuidFilename) {

        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        HttpFileCollection Files = PageInstance.Request.Files;
        NameValueCollection ReturnObj = new NameValueCollection();

        if (Files.Count > FileIndex) {

            HttpPostedFile PostedFile = Files[FileIndex];
            if (String.IsNullOrEmpty(FileName)) {
                FileName = PostedFile.FileName;
            }
            string TempFileName = GetGuidFileName(FileName);
            string SaveLocation = PageInstance.Server.MapPath(FileFolder) + TempFileName;
            PostedFile.SaveAs(SaveLocation);
            if (Rotation > 0) {
                RotateImage(TempFileName, FileFolder, TempFileName, FileFolder, Rotation);
            }
            string FileNameToSave = ParseFileName(FileName, FileFolder, DoOverwrite, SaveFileWithGuidFilename);
            System.IO.File.Move(PageInstance.Server.MapPath(FileFolder + TempFileName), PageInstance.Server.MapPath(FileFolder + FileNameToSave)); // Rename
            ReturnObj[ReturnFileNameParamName] = FileNameToSave;
            ReturnObj[ReturnFilePathParamName] = GetFileUrl(FileNameToSave, FileFolder);

        } else {
            ReturnObj[ReturnErrorParamName] = "File was not found";
        }
        return ReturnObj;
    }

    private static string GetGuidFileName(string FileName)
    {
        string Extension = "";
        if (FileName.LastIndexOf(".") != -1) {
            Extension = FileName.Substring(FileName.LastIndexOf("."), FileName.Length - FileName.LastIndexOf("."));
        }
        FileName = GetGuid();
        if (!string.IsNullOrEmpty(Extension)) {
            FileName += Extension;
        }
        return FileName;
    }

    private static string ParseFileName(string FileName, string FileFolder, bool DoOverwrite, bool SaveFileWithGuidFilename)
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        if (!Directory.Exists(PageInstance.Server.MapPath(FileFolder))) {
            Directory.CreateDirectory(PageInstance.Server.MapPath(FileFolder));
        }
        if (SaveFileWithGuidFilename) {
            FileName = GetGuidFileName(FileName);
        }
        FileName = FileName.Replace("/", "")
            .Replace("\\", "")
            .Replace(":", "")
            .Replace("'", "")
            .Replace("+", "")
            .Replace("%", "")
            .Replace("#", "")
            .Replace(";", "")
            .Replace(">", "")
            .Replace("<", "")
            .Replace("/", "")
            .Replace("*", "")
            .Replace("%", "")
            .Replace("$", "")
            .Replace("|", "")
            .Replace("?", "")
            .Replace(@"""", "")
            .Replace("'", "")
            .Replace(" ", "_");

        while (FileName.Split('.').Length - 1 > 1) // As long as there is more then 1 dot, remove first dot
        {
            int DotIndex = FileName.IndexOf(".");
            FileName = (DotIndex < 0) ? FileName : FileName.Remove(DotIndex, 1);
        }


        if (string.IsNullOrEmpty(FileName)) {
            FileName = GetGuid();
        } else if (FileName.StartsWith(".") && FileName.Split('.').Length <= 2) {
            FileName = GetGuid() + FileName;
        }
        if (!DoOverwrite) {
            FileName = GetNonOverwrittenFileName(FileName, FileFolder);
        }
        return FileName;

    }

    public static string GetFilePath(string Filename, string FileDir) {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        if (PageInstance == null) {
            return FileDir + Filename;
        } else {
            return PageInstance.Server.MapPath(FileDir) + Filename;
        }
    }

    public static string GetNonOverwrittenFileName(string FileName, string FileFolder) {

        try {

            System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
            string FilesNumberingType = "parenthesis";
            if (PageInstance.Request.Browser.Type.ToUpper().Contains("IE")) {
                if (PageInstance.Request.Browser.MajorVersion <= 9) {
                    FileName = FileName
                        .Replace("(", "-")
                        .Replace(")", "-");
                    FilesNumberingType = "underline";
                }
            }

            string Extension = "";
            string CurFileName = FileName;
            if (FileName.LastIndexOf(".") != -1) {
                Extension = FileName.Substring(FileName.LastIndexOf("."), FileName.Length - FileName.LastIndexOf("."));
                CurFileName = FileName.Substring(0, FileName.LastIndexOf("."));
            }
            int CurNum = 0;
            while (System.IO.File.Exists(GetFilePath(FileName, FileFolder))) {
                CurNum++;
                if (FilesNumberingType == "parenthesis") {
                    FileName = CurFileName + "(" + Convert.ToString(CurNum) + ")" + Extension;
                } else {
                    FileName = CurFileName + "_" + Convert.ToString(CurNum) + Extension;
                }
            }

        } catch (Exception e) {
        }
        return FileName;

    }

    public static string GetFileExtension(string FileName) {

        if (FileName != null) {
            if (FileName.LastIndexOf(".") != -1) {
                string ReturnStr = FileName.Substring(FileName.LastIndexOf(".") + 1, FileName.Length - FileName.LastIndexOf(".") - 1);
                return ReturnStr.ToLower();
            } else {
                return "";
            }
        } else {
            return "";
        }

    }

    public static System.Drawing.Imaging.ImageFormat GetImageFormatByFileExtension(string FileName) {
        try {
            System.Drawing.Imaging.ImageFormat ImgFormat = System.Drawing.Imaging.ImageFormat.Png;
            string Extens = GetFileExtension(FileName);
            if (Extens == "jpg" || Extens == "jpeg") {
                ImgFormat = System.Drawing.Imaging.ImageFormat.Jpeg;
            } else if (Extens == "bmp") {
                ImgFormat = System.Drawing.Imaging.ImageFormat.Bmp;
            }
            return ImgFormat;
        } catch (Exception e) {
        }
        return null;
    }

    private static void RotateImage(string FileToRotateName, string FileToRotateFolder, string NewFileName, string NewFileFolder, int Rotation) {
        try {

            System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
            NewFileName = ParseFileName(NewFileName, NewFileFolder, true, false);
            string DestanationImg = PageInstance.Server.MapPath(NewFileFolder + NewFileName);
            System.Drawing.Image Image = System.Drawing.Image.FromFile(PageInstance.Server.MapPath(FileToRotateFolder) + Convert.ToString(FileToRotateName));

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
            if (System.IO.File.Exists(DestanationImg)) {
                System.IO.File.Delete(DestanationImg);
            }
            Bmp.Save(DestanationImg, GetImageFormatByFileExtension(NewFileName));
            Bmp.Dispose();

        } catch (Exception e) {
        }
    }

    public static string GetFileUrl(string FileName, string fileDir) {
        try {
            System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
            if (PageInstance == null) {
                return null;
            }
            string Str = "//" + PageInstance.Request.ServerVariables["SERVER_NAME"] + (new System.Web.UI.Control()).ResolveUrl(fileDir) + FileName;
            return Str;
        } catch (Exception) {
        }
        return null;
    }

    private static string ParseJsonStringValue(string Str) {

        Str = Str.Replace(Convert.ToString(Convert.ToChar(8232)), "\n");
        Str = Str.Replace(Convert.ToString(Convert.ToChar(8233)), "\n");
        Str = System.Web.HttpUtility.JavaScriptStringEncode(Str);
        return Str;

    }

    public static string GetGuid() {
        return (Guid.NewGuid().ToString());
    }

    public static bool IsFileTypeValid(string FileName, String[] AllowedFilesTypes)
    {
        string Extension = GetFileExtension(FileName).ToLower();
        if (!string.IsNullOrEmpty(Extension) && Array.IndexOf(AllowedFilesTypes, Extension) >= 0) {
            return true;
        } else {
            return false;
        }
    }


    public class ImageCropper {

        public string FileToCropPath = "";
        public string NewFileToSavePath = "";
        public ScaleMode ResizeType = ScaleMode.None;

        public int OutputWidth = -1;
        public int OutputHeight = -1;

        public float ManualCropPositionX = -1;
        public float ManualCropPositionY = -1;
        public float ManualCropWidth = -1;
        public float ManualCropHeight = -1;
        public float ManualCropRotate = -1;
        public float ManualCropScaleX = -1;
        public float ManualCropScaleY = -1;

        public static string ManualCropXParamName = "crop_x";
        public static string ManualCropYParamName = "crop_y";
        public static string ManualCropWidthParamName = "crop_width";
        public static string ManualCropHeightParamName = "crop_height";
        public static string ManualCropRotateParamName = "crop_rotate";
        public static string ManualCropScaleXParamName = "crop_scaleX";
        public static string ManualCropScaleYParamName = "crop_scaleY";

        public enum ScaleMode
        {
        None = 0,
            ProportionalInside = 1,
            ProportionalOutside = 2,
            ProportionalCropOutsideTopLeft = 3,
            ProportionalCropOutsideTopCenter = 4,
            ProportionalCropOutsideTopRight = 5,
            ProportionalCropOutsideMiddleLeft = 6,
            ProportionalCropOutsideMiddleCenter = 7,
            ProportionalCropOutsideMiddleRight = 8,
            ProportionalCropOutsideBottomLeft = 9,
            ProportionalCropOutsideBottomCenter = 10,
            ProportionalCropOutsideBottomRight = 11,
            Stretch = 14,
            Manual = 20
    };

        public void PopulateInstanceVariablesFromRequestParams()
    {
        System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;
        float.TryParse(Convert.ToString(PageInstance.Request[ManualCropXParamName]), out ManualCropPositionX);
        float.TryParse(Convert.ToString(PageInstance.Request[ManualCropYParamName]), out ManualCropPositionY);
        float.TryParse(Convert.ToString(PageInstance.Request[ManualCropWidthParamName]), out ManualCropWidth);
        float.TryParse(Convert.ToString(PageInstance.Request[ManualCropHeightParamName]), out ManualCropHeight);
        float.TryParse(Convert.ToString(PageInstance.Request[ManualCropRotateParamName]), out ManualCropRotate);
        float.TryParse(Convert.ToString(PageInstance.Request[ManualCropScaleXParamName]), out ManualCropScaleX);
        float.TryParse(Convert.ToString(PageInstance.Request[ManualCropScaleYParamName]), out ManualCropScaleY);
    }

        public string Crop()
    {
        if (OutputWidth > 0 && OutputHeight > 0
            && ResizeType != ScaleMode.None
            && !string.IsNullOrEmpty(FileToCropPath)
            && !string.IsNullOrEmpty(NewFileToSavePath)) {
            System.Drawing.Image CurImage = System.Drawing.Image.FromFile(FileToCropPath);
            if (CurImage != null) {
                Bitmap Bmp = new Bitmap(CurImage);
                Bitmap CroppedBmp = null;
                if (ResizeType != ScaleMode.Manual) {
                    CroppedBmp = AutoScaleBitmap(Bmp);
                }
                else {
                    PopulateInstanceVariablesFromRequestParams();
                    if (ManualCropWidth > 0 && ManualCropHeight > 0) {
                        CroppedBmp = ManualScaleBitmap(Bmp);
                    }
                }
                Bmp.Dispose();
                CurImage.Dispose();
                if (CroppedBmp != null) {
                    CroppedBmp.Save(NewFileToSavePath);
                    CroppedBmp.Dispose();
                    if (ResizeType == ScaleMode.Manual
                        && ManualCropWidth > 0 && ManualCropHeight > 0) {
                        string FileNewName = Path.GetFileNameWithoutExtension(NewFileToSavePath) + ".png";
                        string FileName = Path.GetFileName(NewFileToSavePath);
                        string FileDir = Path.GetDirectoryName(NewFileToSavePath) + "/";
                        FileNewName = RenameFile(FileName, FileDir, FileNewName);
                        return FileNewName;
                    }
                }

            }

        }
        return Path.GetFileName(NewFileToSavePath);
    }

        public static string RenameFile(string FileName, string FileDir, string FileNewName) {

        if (FileName != null && FileName != "") {
            if (FileName.ToLower() == FileNewName.ToLower()) {
                return FileNewName;
            }
            System.Web.HttpContext PageInstance = System.Web.HttpContext.Current;

            if (!FileNewName.Contains(".")) {
                FileNewName = FileNewName + "." + GetFileExtension(FileName);
            }
            FileNewName = GetNonOverwrittenFileName(FileNewName, FileDir);

            string NewFilePath = FileDir + FileNewName;
            if (!Path.IsPathRooted(FileDir)) {
                NewFilePath = PageInstance.Server.MapPath(FileDir + FileNewName);
            }
            if (System.IO.File.Exists(NewFilePath)) {
                System.IO.File.Delete(NewFilePath);
            }

            if (!Path.IsPathRooted(FileDir)) {
                File.Move(PageInstance.Server.MapPath(FileDir) + FileName, PageInstance.Server.MapPath(FileDir) + FileNewName);
            } else {
                File.Move(FileDir + FileName, FileDir + FileNewName);
            }

            return FileNewName;
        } else {
            return null;
        }
    }

        private Bitmap AutoScaleBitmap(Bitmap Bmp)
    {
        return AutoScaleBitmap(Bmp, OutputWidth, OutputHeight, ResizeType);
    }

        public static Bitmap AutoScaleBitmap(Bitmap Bmp, int OutputWidth, int OutputHeight, ScaleMode ResizeType)
    {

        if (ResizeType == ScaleMode.None) {
            return Bmp;
        }
        else {
            int SrcWidth = Bmp.Width;
            int SrcHeight = Bmp.Height;

            decimal RatioX = Decimal.Divide(OutputWidth, SrcWidth);
            decimal RatioY = Decimal.Divide(OutputHeight, SrcHeight);
            int ResizeToWidth = 0;
            int ResizeToHeight = 0;

            bool ScaleModeIsProporitonalCropOutside = (ResizeType == ScaleMode.ProportionalOutside
                || ResizeType == ScaleMode.ProportionalCropOutsideBottomCenter
                || ResizeType == ScaleMode.ProportionalCropOutsideBottomLeft
                || ResizeType == ScaleMode.ProportionalCropOutsideBottomRight
                || ResizeType == ScaleMode.ProportionalCropOutsideMiddleCenter
                || ResizeType == ScaleMode.ProportionalCropOutsideMiddleLeft
                || ResizeType == ScaleMode.ProportionalCropOutsideMiddleRight
                || ResizeType == ScaleMode.ProportionalCropOutsideTopCenter
                || ResizeType == ScaleMode.ProportionalCropOutsideTopLeft
                || ResizeType == ScaleMode.ProportionalCropOutsideTopRight);

            if (ScaleModeIsProporitonalCropOutside) {

                if (RatioX > RatioY) {
                    ResizeToWidth = OutputWidth;
                    ResizeToHeight = Convert.ToInt32(Decimal.Multiply(SrcHeight, RatioX));
                }
                else {
                    ResizeToWidth = Convert.ToInt32(Decimal.Multiply(SrcWidth, RatioY));
                    ResizeToHeight = OutputHeight;
                }

            }
            else if (ResizeType == ScaleMode.ProportionalInside) {

                if ((RatioX < RatioY && RatioX > 0) || RatioY <= 0) {
                    ResizeToWidth = OutputWidth;
                    ResizeToHeight = Convert.ToInt32(Decimal.Multiply(SrcHeight, RatioX));
                }
                else {
                    ResizeToWidth = Convert.ToInt32(Decimal.Multiply(SrcWidth, RatioY));
                    ResizeToHeight = OutputHeight;
                }
            }
            else if (ResizeType == ScaleMode.Stretch) {
                ResizeToWidth = OutputWidth;
                ResizeToHeight = OutputHeight;
            }
            Bitmap NewBmp = new Bitmap(ResizeToWidth, ResizeToHeight);

            System.Drawing.Graphics gr = System.Drawing.Graphics.FromImage(NewBmp);
            gr.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
            gr.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
            gr.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.High;

            System.Drawing.Rectangle RectDestination = new System.Drawing.Rectangle(0, 0, ResizeToWidth, ResizeToHeight);
            gr.DrawImage(Bmp, RectDestination, 0, 0, SrcWidth, SrcHeight, GraphicsUnit.Pixel);

            if (ScaleModeIsProporitonalCropOutside) {

                int x = (ResizeToWidth - OutputWidth) / 2;
                int y = (ResizeToHeight - OutputHeight) / 2;

                if (ResizeType == ScaleMode.ProportionalCropOutsideTopCenter) {
                    x = (ResizeToWidth - OutputWidth) / 2;
                    y = 0;
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideTopLeft) {
                    x = 0;
                    y = 0;
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideTopRight) {
                    x = (ResizeToWidth - OutputWidth);
                    y = 0;
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideMiddleCenter) {
                    x = (ResizeToWidth - OutputWidth) / 2;
                    y = (ResizeToHeight - OutputHeight) / 2;
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideMiddleLeft) {
                    x = 0;
                    y = (ResizeToHeight - OutputHeight) / 2;
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideTopRight) {
                    x = (ResizeToWidth - OutputWidth);
                    y = (ResizeToHeight - OutputHeight) / 2;
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideBottomCenter) {
                    x = (ResizeToWidth - OutputWidth) / 2;
                    y = (ResizeToHeight - OutputHeight);
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideBottomLeft) {
                    x = 0;
                    y = (ResizeToHeight - OutputHeight);
                }
                else if (ResizeType == ScaleMode.ProportionalCropOutsideBottomRight) {
                    x = (ResizeToWidth - OutputWidth);
                    y = (ResizeToHeight - OutputHeight);
                }

                System.Drawing.Rectangle Rect = new System.Drawing.Rectangle(x, y, OutputWidth, OutputHeight);
                NewBmp = NewBmp.Clone(Rect, NewBmp.PixelFormat);
            }
            return NewBmp;
        }
    }

        public Bitmap ManualScaleBitmap(Bitmap Bmp)
    {
        Bitmap NewBmp = Bmp.Clone() as Bitmap;

        if (ManualCropWidth == 0 || ManualCropHeight == 0) {
            return NewBmp;
        }

        if (ManualCropScaleX == -1) {
            NewBmp.RotateFlip(RotateFlipType.RotateNoneFlipX);
        }
        if (ManualCropScaleY == -1) {
            NewBmp.RotateFlip(RotateFlipType.RotateNoneFlipY);
        }
        if (ManualCropRotate != 0) {
            NewBmp = RotateBitmap(NewBmp, ManualCropRotate);
        }

        Rectangle CropRect = new Rectangle((int)ManualCropPositionX, (int)ManualCropPositionY, (int)ManualCropWidth, (int)ManualCropHeight);
        Bitmap CroppedBmp = NewBmp.Clone(CropRect, NewBmp.PixelFormat);
        NewBmp.Dispose();

        CroppedBmp = AutoScaleBitmap(CroppedBmp, OutputWidth, OutputHeight, ScaleMode.ProportionalOutside);
        return CroppedBmp;

    }

        public Bitmap RotateBitmap(Bitmap Bmp, float Angle)
    {
        int BmpWidth = Bmp.Width;
        int BmpHeight = Bmp.Height;
        double CurAngle = Angle * Math.PI / 180;
        double CurAngleCos = Math.Abs(Math.Cos(CurAngle));
        double CurAngleSin = Math.Abs(Math.Sin(CurAngle));
        int ReturnBmpWidth = (int)(BmpWidth * CurAngleCos + BmpHeight * CurAngleSin);
        int ReturnBmpHeight = (int)(BmpWidth * CurAngleSin + BmpHeight * CurAngleCos);
        Bitmap ReturnBitmap = new Bitmap(ReturnBmpWidth, ReturnBmpHeight);
        Graphics g = Graphics.FromImage(ReturnBitmap);
        g.TranslateTransform((float)(ReturnBmpWidth - BmpWidth) / 2, (float)(ReturnBmpHeight - BmpHeight) / 2);
        g.TranslateTransform((float)Bmp.Width / 2, (float)Bmp.Height / 2);
        g.RotateTransform(Angle);
        g.TranslateTransform(-(float)Bmp.Width / 2, -(float)Bmp.Height / 2);
        g.DrawImage(Bmp, new Point(0, 0));
        Bmp.Dispose();
        return ReturnBitmap;
    }

    }

</script>