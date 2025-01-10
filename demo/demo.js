var uploaderDefault;
var uploaderSingleFile;
var uploaderNoMetadata;
var uploaderDisabled;
var uploaderPreDefinedFiles;
var uploaderProgressBar;
var uploaderRtl;
var uploaderNoDragDrop;
var uploaderNoCancelDelete;
var uploaderNoResults;
var uploaderCrossDomain;
var uploaderWithValidations;
var uploaderNoOverwrite;
var uploaderWithAutoCrop;
var uploaderWithManualCrop;
var uploaderGroupResults;
var uploaderCustomCss;
var uploaderCustomHTML;

var iframeGateway = "../SlashUploader/iframe_gateway.html";

var crossDomainScripts = {
    uploadChunk: "//slashuploader.com/src/js/SlashUploader/server/UploadFiles.aspx?upload_method=upload_chunk&file_name={{file_name}}&chunk_index={{chunk_index}}&total_chunks={{total_chunks}}&request_id={{request_id}}&rotation={{rotation}}&file_size={{size}}&file_rotation={{rotation}}&file_duration={{duration}}&file_w={{width}}&file_h={{height}}&file_ext={{extension}}",
    uploadStream: "//slashuploader.com/src/js/SlashUploader/server/UploadFiles.aspx?upload_method=upload_stream&rotation={{rotation}}&file_name={{file_name}}&file_size={{size}}&file_rotation={{rotation}}&file_duration={{duration}}&file_w={{width}}&file_h={{height}}&file_ext={{extension}}",
    uploadThroughIframe: "//slashuploader.com/src/js/SlashUploader/server/UploadFiles.aspx?upload_method=upload_through_iframe&rotation={{rotation}}&request_id={{request_id}}&iframe_gateway={{iframe_gateway}}&file_size={{size}}&file_rotation={{rotation}}&file_duration={{duration}}&file_w={{width}}&file_h={{height}}&file_ext={{extension}}"
};

var sameDomainScripts = {
    uploadChunk: "../SlashUploader/server/UploadFiles.aspx?upload_method=upload_chunk&file_name={{file_name}}&chunk_index={{chunk_index}}&total_chunks={{total_chunks}}&request_id={{request_id}}&rotation={{rotation}}&file_size={{size}}&file_rotation={{rotation}}&file_duration={{duration}}&file_w={{width}}&file_h={{height}}&file_ext={{extension}}",
    uploadStream: "../SlashUploader/server/UploadFiles.aspx?upload_method=upload_stream&rotation={{rotation}}&file_name={{file_name}}&file_size={{size}}&file_rotation={{rotation}}&file_duration={{duration}}&file_w={{width}}&file_h={{height}}&file_ext={{extension}}",
    uploadThroughIframe: "../SlashUploader/server/UploadFiles.aspx?upload_method=upload_through_iframe&rotation={{rotation}}&request_id={{request_id}}&iframe_gateway={{iframe_gateway}}&file_size={{size}}&file_rotation={{rotation}}&file_duration={{duration}}&file_w={{width}}&file_h={{height}}&file_ext={{extension}}"
};




function init() {
    setTimeout(function () {
        buildUploaders();
    }, 10);
}

if (typeof console == "undefined") console = { // Prevent old browsers error
    log: function () { },
    debug: function () { },
    error: function () { },
    warn: function () { }
};

function buildUploaders() {

    var onFilesSelected = function (files) {
        console.log("onFilesSelected", files);
        var str = "<u>Files selected:</u><br>";
        for (var i = 0; i < files.length; i++) {
            str += files[i].name + "; " + files[i].width + "x" + files[i].height + "<br>";
        }
        var responseElement = this.elements.containerElement.parentNode.parentNode.querySelector(".uploader_status");
        responseElement.innerHTML = str;
    };

    var onFilesUploaded = function (files) {
        console.log("onFilesUploaded", files);
        var str = "<u>Files uploaded:</u><br>";
        for (var i = 0; i < files.length; i++) {
            str += files[i].file_name + "<br>";
        }
        var responseElement = this.elements.containerElement.parentNode.parentNode.querySelector(".uploader_status");
        responseElement.innerHTML = str;
    };

    var onFileDeleted = function (deletedFile, files) {
        console.log("onFileDeleted", deletedFile, files);
        var str = "<u>deleted:</u> ";
        str += deletedFile.file_name + "<br>";
        str += "<u>Files remaining:</u><br>";
        for (var i = 0; i < files.length; i++) {
            str += files[i].file_name + "<br>";
        }
        var responseElement = this.elements.containerElement.parentNode.parentNode.querySelector(".uploader_status");
        responseElement.innerHTML = str;
    }

    var onFilesProgress = function (curUploadingFileProgress, curUploadingFileIndex, totalFilesToUpload) {
        var str = Math.floor(curUploadingFileProgress * 100) + "% (" + curUploadingFileIndex + "/" + totalFilesToUpload + ")";
        console.log("onFilesProgress", str);
        var responseElement = this.elements.containerElement.parentNode.parentNode.querySelector(".uploader_status");
        responseElement.innerHTML = str;
    };

    var onCanceled = function () {
        var str = "Canceled";
        var responseElement = this.elements.containerElement.parentNode.parentNode.querySelector(".uploader_status");
        responseElement.innerHTML = str;
    };

    var onError = function (errors) {
        console.log("onError", errors);
        var str = "<u>Error with files:</u><br>";
        for (var i = 0; i < errors.length; i++) {
            if (errors[i].file != null) {
                str += errors[i].file.name + "<br>";
            }
        }
        var responseElement = this.elements.containerElement.parentNode.parentNode.querySelector(".uploader_status");
        responseElement.innerHTML = str;
    };


    uploaderDefault = new SlashUploader(document.getElementById("uploader_default"), {
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });

    uploaderSingleFile = new SlashUploader(document.getElementById("uploader_single_file"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        showFocusRect: true,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderSingleFile.dropFilesText = "Drop file here";
    uploaderSingleFile.browseText = "Drop file here or click to upload";
    uploaderSingleFile.maxFiles = 1;


    uploaderNoMetadata = new SlashUploader(document.getElementById("uploader_no_metadata"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderNoMetadata.doGetFileMetadata = false;

    uploaderDisabled = new SlashUploader(document.getElementById("uploader_disabled"), {
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderDisabled.uploadedFiles = [
        { file_name: "2015-08-13(2).jpg", file_path: "//mydomain.com/uploads/2015-08-13(2).jpg" },
        { file_name: "test.png", file_path: "//mydomain.com/uploads/test.png" }
    ];
    uploaderDisabled.disabled = true;
    uploaderDisabled.onFilesUploaded = function (files) {
        this.disabled = true;
    };

    uploaderPreDefinedFiles = new SlashUploader(document.getElementById("uploader_pre_defined_files"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderPreDefinedFiles.uploadedFiles = [
        { file_name: "2015-08-13(2).jpg", file_path: "//mydomain.com/uploads/2015-08-13(2).jpg" },
        { file_name: "test.png", file_path: "//mydomain.com/uploads/test.png" }
    ];


    uploaderProgressBar = new SlashUploader(document.getElementById("uploader_progress_bar"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderProgressBar.progressAnimationType = "inline|bar";


    uploaderRtl = new SlashUploader(document.getElementById("uploader_rtl"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderRtl.progressAnimationType = "inline|bar";
    uploaderRtl.rtl = true;
    uploaderRtl.maxFileChars = 10;
    uploaderRtl.browseText = "הנח קבצים כאן או לחץ לבחירת קבצים";
    uploaderRtl.browseTextDropDisabled = "לחץ לבחירת קובץ";
    uploaderRtl.dropFilesText = "הנח קבצים כאן";
    uploaderRtl.uploadingFileText = "מעלה את \"{{current_file_name}}\"...";
    uploaderRtl.uploadingFileTextProgressBar = "מעלה את \"{{current_file_name}}\"...";
    uploaderRtl.uploadingFilesText = "מעלה {{total_files}} קבצים...";
    uploaderRtl.uploadingFilesTextProgressBar = "מעלה {{total_files}} קבצים...";
    uploaderRtl.uploadingFileByFileText = "מעלה את הקובץ \"{{current_file_name}}\" (קובץ {{current_file_index}} מתוך {{total_files}})";
    uploaderRtl.cancelText = "ביטול";
    uploaderRtl.uploadedFileTemplate = function (fileData) {
        if (fileData.file_name.toLowerCase().indexOf(".jpg") != -1 || fileData.file_name.toLowerCase().indexOf(".png") != -1) {
            return "<img src='" + fileData.file_path + "' height='40' />"
        } else {
            return "<a style='direction: rtl; font-weight: bold;' href='" + fileData.file_path + "' target='_blank'>" + fileData.file_name + "</a>";
        }
    }
    uploaderRtl.errors = {
        invalidFileExtension: "סוג הקובץ לא נתמך",
        invalidFileSize: "הקובץ כבד מדי",
        parseFailed: "פירסוס מידע נכשל",
        unspecifiedError: "תקלה לא מזוהת",
        uploadFailed: "העלאה נכשלה"
    };

    uploaderNoDragDrop = new SlashUploader(document.getElementById("uploader_no_drag_drop"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderNoDragDrop.enableDropFiles = false;



    uploaderNoCancelDelete = new SlashUploader(document.getElementById("uploader_no_cancel_delete"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderNoCancelDelete.enableCancelButton = false;
    uploaderNoCancelDelete.enableDeleteButton = false;


    uploaderNoResults = new SlashUploader(document.getElementById("uploader_no_results"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderNoResults.uploadedFilesPosition = "none";


    uploaderCrossDomain = new SlashUploader(document.getElementById("uploader_field_cross_domain"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderCrossDomain.serverScripts = crossDomainScripts;
    uploaderCrossDomain.progressAnimationType = "inline|bar";




    uploaderWithValidations = new SlashUploader(document.getElementById("uploader_field_validations"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        showFocusRect: true,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderWithValidations.allowedFilesExtensions = ["mp4", "mov", "avi", "ogv", "wmv", "flv", "mkv", "mpg", "webm"];
    uploaderWithValidations.allowedMaxFileSize = 5000;
    uploaderWithValidations.customValidation = function (file) {
        if (file.duration == null) {
            console.log("Couldn't read metadata for '" + file.name + "', so duration validation isn't possible");
        } else if (file.duration < 10) {
            return { error: 'invalid_duration', error_text: "\"{{file_name}}\" duration is less then 10 seconds." };
        }
    };
    uploaderWithValidations.errors = {
        invalidFileExtension: "File \"{{file_name}}\" is not a supportted video format.",
        invalidFileSize: "File \"{{file_name}}\" exceeds 5MB."
    };
    uploaderWithValidations.acceptOnlyFilesTypes = "video/*";
    uploaderWithValidations.maxFileChars = 18;
    uploaderWithValidations.resetFilesOnEachUpload = false;


    uploaderNoOverwrite = new SlashUploader(document.getElementById("uploader_no_overwrite"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderNoOverwrite.resetFilesOnEachUpload = false;
    uploaderNoOverwrite.progressAnimationType = "inline|bar";
    uploaderNoOverwrite.maxFiles = 6;


    var cropWidth = 400;
    var cropHeight = 300;
    uploaderWithAutoCrop = new SlashUploader(document.getElementById("uploader_with_auto_crop"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        compressImageWidth: cropWidth,
        compressImageHeight: cropHeight,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    var autoCropFields = "&resize_type=ProportionalCropOutsideBottomRight&resize_output_width=" + cropWidth + "&resize_output_height=" + cropHeight;
    uploaderWithAutoCrop.serverScripts.uploadChunk = uploaderWithAutoCrop.serverScripts.uploadChunk + autoCropFields;
    uploaderWithAutoCrop.serverScripts.uploadStream = uploaderWithAutoCrop.serverScripts.uploadStream + autoCropFields;
    uploaderWithAutoCrop.serverScripts.uploadThroughIframe = uploaderWithAutoCrop.serverScripts.uploadThroughIframe + autoCropFields;


    if (navigator.appVersion.indexOf("MSIE 8") == -1
        && navigator.appVersion.indexOf("MSIE 9") == -1) {

        uploaderWithManualCrop = new SlashUploader(document.getElementById("uploader_with_manual_crop"), {
            onFilesUploaded: onFilesUploaded,
            onFilesProgress: onFilesProgress,
            onFileDeleted: onFileDeleted,
            onCanceled: onCanceled,
            onError: onError,
            compressImageWidth: cropWidth * 3,
            compressImageHeight: cropHeight * 3,
            onFilesSelected: function (files, continueUpload) {
                ImageCropper.startCropImages(files, uploaderWithManualCrop, cropWidth / cropHeight, continueUpload);
            },
            iframeGateway: iframeGateway,
            serverScripts: sameDomainScripts
        });
        var manualCropFields = "&resize_type=Manual&resize_output_width=" + cropWidth + "&resize_output_height=" + cropHeight + "&crop_x={{crop_x}}&crop_y={{crop_y}}&crop_width={{crop_width}}&crop_height={{crop_height}}&crop_rotate={{crop_rotate}}&crop_scaleX={{crop_scaleX}}&crop_scaleY={{crop_scaleY}}";
        uploaderWithManualCrop.serverScripts.uploadChunk = uploaderWithManualCrop.serverScripts.uploadChunk + manualCropFields;
        uploaderWithManualCrop.serverScripts.uploadStream = uploaderWithManualCrop.serverScripts.uploadStream + manualCropFields;
        uploaderWithManualCrop.serverScripts.uploadThroughIframe = uploaderWithManualCrop.serverScripts.uploadThroughIframe + manualCropFields;

    }

    uploaderGroupResults = new SlashUploader(document.getElementById("uploader_group"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderGroupResults.groupUploadedFilesResult = true;
    uploaderGroupResults.uploadedFileTemplate = function (files) {
        if (files.length == 1) {
            return "Uploaded one file";
        } else {
            return "Uploaded " + files.length + " files";
        }
    };

    uploaderCustomCss = new SlashUploader(document.getElementById("uploader_custom_css"), {
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        height: 150,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });
    uploaderCustomCss.progressAnimationType = "inline|bar";



    uploaderCustomHTML = new SlashUploader(document.getElementById("uploader_field_custom_button"), {
        customHTML: true,
        onFilesSelected: onFilesSelected,
        onFilesUploaded: onFilesUploaded,
        onFilesProgress: onFilesProgress,
        onFileDeleted: onFileDeleted,
        onCanceled: onCanceled,
        onError: onError,
        iframeGateway: iframeGateway,
        serverScripts: sameDomainScripts
    });


}