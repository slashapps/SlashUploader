/*
 * SlashUploader - JS plugin - Version 1.5.2
 * Copyright (c) 2018 Slash Apps Development, http://slash.co.il/
 * Licensed under the MIT License [https://en.wikipedia.org/wiki/MIT_License]
 */

function FileData (file) {

	this.file;
	this.name;
	this.size;
	this.duration;
	this.width;
	this.height;
	this.extension;

	this.init = function (file) {
		this.file = file;
		var fileName = file.name;
		if (fileName == null) {
	    	fileName = "";
	    }
		this.name = fileName;
		this.size = file.size;
		this.extension = fileName.substr(fileName.lastIndexOf(".")+1, 5).toLowerCase();
	}
	this.init(file);
}

function SlashUploader (element, opts) {

	this.opts = opts;
	this._internalVariables = {};
	this._internalVariables.instance = this;
	this._internalVariables.hoverOnBtn = false;
	this._internalVariables.draggedOnBtn = false;
	this._internalVariables.isUploading = false;
	this._internalVariables.draggedOnDocument = false;
    this._internalVariables.curUploadingFileIndex = 0;
    this._internalVariables.curUploadingFilesData = [];
    this._internalVariables.totalFilesToUpload = 0;
    this._internalVariables.BYTES_PER_CHUNK = 77570; // sample chunk sizes.
    this._internalVariables.curMouseX = -1;
    this._internalVariables.lastMouseX = -1;
    this._internalVariables.curMouseY = -1;
    this._internalVariables.lastMouseY = -1;
    this._internalVariables.uploadFileChunkXhr = null;
	this._internalVariables.displayErrorAnimationTimeoutDuration;
	this._internalVariables.onChangeTriggered = false;

	this._internalVariables.setVariable = function (variableName) {
		var instance = this.instance;
		if (variableName == "acceptOnlyFilesTypes") {
			noJquery(instance.elements.uploaderInputElement).attr("accept", instance.acceptOnlyFilesTypes);
		} else if (variableName == "maxFiles") {

			if (instance.maxFiles > 1) {
				if (instance.elements.uploaderInputElement != null) {
					noJquery(instance.elements.uploaderInputElement).attr("multiple", "multiple");
				}
			} else {
				if (instance.elements.uploaderInputElement != null) {
					noJquery(instance.elements.uploaderInputElement).removeAttr('multiple');
				}
			}

		} else if (variableName == "showUploadedFiles") {
			if (instance.showUploadedFiles) {
				//noJquery(instance.elements.uploaderResultWrapperElement).attr("style", "");
				noJquery(instance.elements.uploaderDropAreaWrapper).css("width", "");
				noJquery(instance.elements.uploaderDropAreaWrapper).css("display", "");
			} else {
				noJquery(instance.elements.uploaderResultWrapperElement).attr("style", "width: 0px; display: none;");
				noJquery(instance.elements.uploaderDropAreaWrapper).css("width", "100%");
			}
		} else if (variableName == "disabled") {
			if (instance.disabled) {
				noJquery(instance.elements.containerElement).addClass("disabled");
				noJquery(instance.elements.uploaderDropAreaElement).find(".input_wrapper").css("display", "none");
			} else {
				noJquery(instance.elements.containerElement).removeClass("disabled");
				noJquery(instance.elements.uploaderDropAreaElement).find(".input_wrapper").css("display", "");
			}
		} else if (variableName == "rtl") {
			if (instance.rtl) {
				noJquery("#"+instance.elements.elementId).addClass("rtl");
			} else {
				noJquery("#"+instance.elements.elementId).removeClass("rtl");
			}
		} else if (variableName == "height") {
			instance._internalVariables.setHeight();
		} else if (variableName == "enableDropFiles") {
			instance._internalVariables.setDropFileEvents();
		} else if (variableName == "progressAnimationType") {
			instance._internalVariables.setProgressDisplay();
		} else if (variableName == "showFocusRect") {
			instance._internalVariables.setShowFocusRect();
		} else if (variableName == "maxFileChars" || variableName == "uploadedFiles" || variableName == "uploadedFileHtml") {
			instance._internalVariables.showCurrentFiles();
		}
		instance._internalVariables.setText();
	}
	var _variables = {};
	
	Object.defineProperty(this, 'acceptOnlyFilesTypes', { // e.g: "image/*", "video/*", "text/html", ".csv", "application/vnd.ms-excel"
	    get: function() {
	        return _variables.acceptOnlyFilesTypes;
	    },
	    set: function(value) {
	        _variables.acceptOnlyFilesTypes = value;
	        this._internalVariables.setVariable("acceptOnlyFilesTypes");
	    }
	});
	Object.defineProperty(this, 'showUploadedFiles', {
	    get: function() {
	        return _variables.showUploadedFiles;
	    },
	    set: function(value) {
	        _variables.showUploadedFiles = value;
	        this._internalVariables.setVariable("showUploadedFiles");
	    }
	});
	Object.defineProperty(this, 'disabled', {
	    get: function() {
	        return _variables.disabled;
	    },
	    set: function(value) {
	        _variables.disabled = value;
	        this._internalVariables.setVariable("disabled");
	    }
	});
	Object.defineProperty(this, 'enableDropFiles', {
	    get: function() {
	        return _variables.enableDropFiles;
	    },
	    set: function(value) {
	        _variables.enableDropFiles = value;
	        this._internalVariables.setVariable("enableDropFiles");
	    }
	});
	Object.defineProperty(this, 'maxFiles', {
	    get: function() {
	        return _variables.maxFiles;
	    },
	    set: function(value) {
	        _variables.maxFiles = value;
	        this._internalVariables.setVariable("maxFiles");
	    }
	});
	Object.defineProperty(this, 'progressAnimationType', {
	    get: function() {
	        return _variables.progressAnimationType;
	    },
	    set: function(value) {
	        _variables.progressAnimationType = value;
	        this._internalVariables.setVariable("progressAnimationType");
	    }
	});
	Object.defineProperty(this, 'maxFileChars', {
	    get: function() {
	        return _variables.maxFileChars;
	    },
	    set: function(value) {
	        _variables.maxFileChars = value;
	        this._internalVariables.setVariable("maxFileChars");
	    }
	});
	Object.defineProperty(this, 'uploadedFiles', {
	    get: function() {
	        return _variables.uploadedFiles;
	    },
	    set: function(value) {
	        _variables.uploadedFiles = value;
	        this._internalVariables.setVariable("uploadedFiles");
	    }
	});

	Object.defineProperty(this, 'browseText', {
	    get: function() {
	        return _variables.browseText;
	    },
	    set: function(value) {
	        _variables.browseText = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'browseTextDropDisabled', {
	    get: function() {
	        return _variables.browseTextDropDisabled;
	    },
	    set: function(value) {
	        _variables.browseTextDropDisabled = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'rtl', {
	    get: function() {
	        return _variables.rtl;
	    },
	    set: function(value) {
	        _variables.rtl = value;
	        this._internalVariables.setVariable("rtl");
	    }
	});
	Object.defineProperty(this, 'height', {
	    get: function() {
	        return _variables.height;
	    },
	    set: function(value) {
	        _variables.height = value;
	        this._internalVariables.setVariable("height");
	    }
	});
	Object.defineProperty(this, 'showFocusRect', {
	    get: function() {
	        return _variables.showFocusRect;
	    },
	    set: function(value) {
	        _variables.showFocusRect = value;
	        this._internalVariables.setVariable("showFocusRect");
	    }
	});
	Object.defineProperty(this, 'dropFilesText', {
	    get: function() {
	        return _variables.dropFilesText;
	    },
	    set: function(value) {
	        _variables.dropFilesText = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'uploadingFileText', {
	    get: function() {
	        return _variables.uploadingFileText;
	    },
	    set: function(value) {
	        _variables.uploadingFileText = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'uploadingFileTextProgressBar', {
	    get: function() {
	        return _variables.uploadingFileTextProgressBar;
	    },
	    set: function(value) {
	        _variables.uploadingFileTextProgressBar = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'uploadingFilesText', {
	    get: function() {
	        return _variables.uploadingFilesText;
	    },
	    set: function(value) {
	        _variables.uploadingFilesText = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'uploadingFilesTextProgressBar', {
	    get: function() {
	        return _variables.uploadingFilesTextProgressBar;
	    },
	    set: function(value) {
	        _variables.uploadingFilesTextProgressBar = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'uploadingFileByFileText', {
	    get: function() {
	        return _variables.uploadingFileByFileText;
	    },
	    set: function(value) {
	        _variables.uploadingFileByFileText = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'uploadedFileHtml', {
	    get: function() {
	        return _variables.uploadedFileHtml;
	    },
	    set: function(value) {
	        _variables.uploadedFileHtml = value;
	        this._internalVariables.setVariable("uploadedFileHtml");
	    }
	});
	Object.defineProperty(this, 'cancelText', {
	    get: function() {
	        return _variables.cancelText;
	    },
	    set: function(value) {
	        _variables.cancelText = value;
	        this._internalVariables.setVariable();
	    }
	});
	Object.defineProperty(this, 'serverScripts', {
	    get: function() {
	        return _variables.serverScripts;
	    },
	    set: function(value) {
	    	var curServerScripts = this.serverScripts;
	    	noJquery.extend(curServerScripts, value);
	    	_variables.serverScripts = curServerScripts;
	    }
	});
	Object.defineProperty(this, 'isUploading', {
	    get: function() {
			if (this._internalVariables != null) {
				return this._internalVariables.isUploading;
			}
	        return false;
	    }
	});


	this.onFilesSelected = null;
	this.onFilesUploaded = null;
	this.onFileDeleted = null;
	this.onFilesProgress = null;
	this.onCanceled = null;
	this.onError = null;
	this.customValidation = null;
	this.customHTML = false;
    this.uploadFileInChunks = true;
    this.resetFilesOnEachUpload = true;
	this.iframeGateway = "./SlashUploader/iframe_gateway.html";
	this.doGetFileMetadata = true;
	this.allowedFilesExtensions = null;
	this.allowedMaxFileSize = null; // maximum file size in KB
	this.showDetailedErrorFromServer = true;
	this.displayErrorDuration = 4500;
	
	_variables.serverScripts = {
		uploadChunk: "./SlashUploader/server/UploadFiles.aspx?method=upload_chunk&file_name={{file_name}}&chunk_index={{chunk_index}}&request_id={{request_id}}",
		combineChunks: "./SlashUploader/server/UploadFiles.aspx?method=combine_chunks&rotation={{rotation}}&file_name={{file_name}}&request_id={{request_id}}",
		uploadStream: "./SlashUploader/server/UploadFiles.aspx?method=upload_stream&rotation={{rotation}}&file_name={{file_name}}",
		uploadThroughIframe: "./SlashUploader/server/UploadFiles.aspx?method=upload_through_iframe&rotation={{rotation}}&request_id={{request_id}}&iframe_gateway={{iframe_gateway}}",
		fileNameVariableName: "file_name",
		fileUrlVariableName: "file_path",
		errorVariableName: "error"
	};


	_variables.showUploadedFiles = true;
	_variables.disabled = false;
	_variables.enableDropFiles = true;
	_variables.maxFiles = 9999;
	_variables.progressAnimationType = "inline";
	_variables.height = 80;
	_variables.showFocusRect = false;
	_variables.maxFileChars = 20;
    _variables.uploadedFiles = [];
    _variables.browseText = "Drop files here or click to upload";
    _variables.browseTextDropDisabled = "Click to upload";
    _variables.dropFilesText = "Drop files here";
    _variables.uploadingFileText = "Uploading \"{{current_file_name}}\"";
    _variables.uploadingFileTextProgressBar = "Uploading \"{{current_file_name}}\"";
	_variables.uploadingFilesText = "Uploading {{total_files}} files";
	_variables.uploadingFilesTextProgressBar = "Uploading {{total_files}} files";
	_variables.uploadingFileByFileText = "Uploading \"{{current_file_name}}\" ({{current_file_index}}/{{total_files}})";
	_variables.uploadedFileHtml = "<a href='{{current_file_path}}' target='_blank'>{{current_file_name}}</a>";
	_variables.cancelText = "Cancel";

    this.elements = {};
	this.elements.elementId = "uploader_"+Math.floor(Math.random()*999999999);
	this.elements.containerElement = element;
    this.elements.uploaderDropAreaElement = null;
    this.elements.uploaderTextElement = null;
    this.elements.uploaderDropAreaWrapper = null;
    this.elements.uploaderDropAreaBottomLayerElement = null;
    this.elements.uploaderDropAreaMiddleLayerElement = null;
    this.elements.uploaderResultWrapperElement = null;
    this.elements.uploaderResultElement = null;
    this.elements.uploaderProgressContainerElement = null;
    this.elements.uploaderProgressBarElement = null;
    this.elements.uploaderProgressBarPaddingElement = null;
	this.elements.uploaderProgressBarTextElement = null;
	this.elements.uploaderProgressBarColorElement = null;
	this.elements.uploaderInputElement = null;
	this.elements.uploaderCancelButton = null;

	this.errors = {};
	this.errors.invalidFileExtension = "Invalid file extension ({{file_name}})";
	this.errors.invalidFileSize = "Invalid file size ({{file_name}})";
	this.errors.uploadFailed = "Failed to upload";
	this.errors.parseFailed = "Failed to parse result";
	this.errors.unspecifiedError = "Unspecified error";

	
	if (navigator.appVersion.indexOf("MSIE") != -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) == 8) {
		// On IE8, set all valiables on interval, since there's no getters and setters on IE8
		var instance = this;
		var prevServerScripts = _variables.serverScripts;
		var prevVars = {};
		function setVariablesTimeout () {
			if (prevVars.acceptOnlyFilesTypes != instance.acceptOnlyFilesTypes) {
				instance._internalVariables.setVariable("acceptOnlyFilesTypes");
			}
			if (prevVars.showUploadedFiles != instance.showUploadedFiles) {
	        	instance._internalVariables.setVariable("showUploadedFiles");
			}
			if (prevVars.disabled != instance.disabled) {
				instance._internalVariables.setVariable("disabled");
			}
			if (prevVars.enableDropFiles != instance.enableDropFiles) {
	        	instance._internalVariables.setVariable("enableDropFiles");
			}
			if (prevVars.maxFiles != instance.maxFiles) {
	        	instance._internalVariables.setVariable("maxFiles");
			}
			if (prevVars.progressAnimationType != instance.progressAnimationType) {
	        	instance._internalVariables.setVariable("progressAnimationType");
			}
			if (!(noJquery(instance.elements.uploaderResultElement).hasClass("error") && noJquery(instance.elements.uploaderResultElement).html() != "")) {
				// Prevent refresh when error is displayed
				if (prevVars.maxFileChars != instance.maxFileChars) {
					instance._internalVariables.setVariable("maxFileChars");
				}
				if (prevVars.uploadedFiles != instance.uploadedFiles) {
					instance._internalVariables.setVariable("uploadedFiles");
				}
			}
			if (prevVars.rtl != instance.rtl) {
	        	instance._internalVariables.setVariable("rtl");
			}
	        instance._internalVariables.setVariable();

	        prevVars.acceptOnlyFilesTypes = instance.acceptOnlyFilesTypes;
	        prevVars.showUploadedFiles = instance.showUploadedFiles;
	        prevVars.disabled = instance.disabled;
	        prevVars.enableDropFiles = instance.enableDropFiles;
	        prevVars.maxFiles = instance.maxFiles;
	        prevVars.progressAnimationType = instance.progressAnimationType;
	        prevVars.maxFileChars = instance.maxFileChars;
	        prevVars.uploadedFiles = instance.uploadedFiles;
			prevVars.rtl = instance.rtl;
			prevVars.height = instance.height;
			prevVars.showFocusRect = instance.showFocusRect;
			
	    	noJquery.extend(prevServerScripts, instance.serverScripts);
	    	instance.serverScripts = prevServerScripts;
	    	
			setTimeout (function () {
				setVariablesTimeout();
			}, 3000);
		}
		setTimeout (function () {
			setVariablesTimeout();
		}, 250);
	}

	//
	//
	//	Elements builder
	//
	//

	this._internalVariables.build = function () {
		var instance = this.instance;

		var IEVersion = instance._internalVariables.getIEVersion();
		if (IEVersion >= 0 && IEVersion <= 8) {
			// Set variables on IE8 again because of IE8 defineProperty polyfill
			for (var obj in _variables) {
				instance[obj] = _variables[obj];
			}
		}

		if (instance.opts != null) {
			noJquery.extend(instance.errors, instance.opts.errors);
			delete instance.opts.errors;
			noJquery.extend(instance.serverScripts, instance.opts.serverScripts);
			delete instance.opts.serverScripts;
			noJquery.extend(instance, instance.opts);
		}

		if (instance.elements.containerElement != null) {

			var curElementToTest = instance.elements.containerElement;
			var curElementToTestTag = curElementToTest.tagName.toUpperCase();
			var containedInForm = false;
			while (curElementToTestTag != "BODY" && !containedInForm) {
				curElementToTest = curElementToTest.parentElement;
				curElementToTestTag = curElementToTest.tagName.toUpperCase();
				if (curElementToTestTag == "FORM") {
					containedInForm = true;
				}
			}
			if (!containedInForm) {

				var html = '<form id="'+instance.elements.elementId+'" name="'+instance.elements.elementId+'" class="uploader_form">';
			    if (!instance.customHTML) {
				    html += '<div class="uploader_div">';
				    html += '	<div class="uploader_drop_area_wrapper">';
				    html += '		<div class="uploader_drop_area_bottom_bg"></div>';
				    html += '		<div class="uploader_drop_area_bottom"><img /></div>';
				    html += '		<div class="uploader_drop_area_middle"><img /></div>';
				    html += '		<div class="uploader_drop_area">';
				    html += '			<div class="uploader_text"><span><div class="uploader_spinner"></div><span></span></span></div>';
				    html += '			<div class="uploader_cancel"><span></span></div>';
				    html += '		</div>';
				    html += '	</div>';
				    html += '	<div class="uploader_result_wrapper"><div class="uploader_result"></div></div>';
				    html += '</div>';
			    	html += '<div class="uploader_progress_container" style="display: none;">';
			    	html += '	<table><tr>';
			    	html += '		<td class="uploader_progress_bar_loading"><div class="uploader_spinner"></div><span></span></td>';
			    	html += '		<td class="uploader_progress_bar_loading_padding"></td>';
			    	html += '		<td class="uploader_progress_bar"><div><div></div></div></td>';
			    	html += '		<td class="uploader_progress_bar_padding"></td>';
			    	html += '		<td class="uploader_progress_bar_text"></td>';
			    	html += '	</tr></table>';
			    	html += '</div>';
			    } else {
			    	html += '<div class="uploader_drop_area_custom">';
			    	html += '</div>';
			    }
			    html += '</form>';

				if (!instance.customHTML) {
					noJquery(instance.elements.containerElement).html (html);
				} else {
					noJquery(instance.elements.containerElement).css("position", "relative");
					noJquery(instance.elements.containerElement).html(html+noJquery(instance.elements.containerElement).html());
				}
				noJquery(instance.elements.containerElement).addClass("slash_uploader");

				//if (
				//	instance.customHTML
				//	|| (IEVersion >= 0 && IEVersion <= 8)
				//	) {
					noJquery(instance.elements.containerElement).on("mousemove", function(event) {
						var element = this;
						if (noJquery(this).find(".uploader_drop_area_wrapper")[0] != null) {
							element = noJquery(this).find(".uploader_drop_area_wrapper")[0];
						}
						noJquery(instance.elements.uploaderDropAreaElement).find("input").css("left", event.pageX-noJquery(element).offset().left-120);
						noJquery(instance.elements.uploaderDropAreaElement).find("input").css("top", event.pageY-noJquery(element).offset().top-20);
					});
				//}
				
			    if (!instance.customHTML) {
					instance.elements.uploaderDropAreaElement = noJquery(instance.elements.containerElement).find(".uploader_drop_area").get(0);
				} else {
					instance.elements.uploaderDropAreaElement = noJquery(instance.elements.containerElement).find(".uploader_drop_area_custom").get(0);
				}
				instance.elements.uploaderTextElement = noJquery(instance.elements.containerElement).find(".uploader_drop_area").find(".uploader_text span").get(0);
				instance.elements.uploaderDropAreaWrapper = noJquery(instance.elements.containerElement).find(".uploader_drop_area_wrapper").get(0);
				instance.elements.uploaderDropAreaBottomLayerElement = noJquery(instance.elements.containerElement).find(".uploader_drop_area_bottom").get(0);
				instance.elements.uploaderDropAreaMiddleLayerElement = noJquery(instance.elements.containerElement).find(".uploader_drop_area_middle").get(0);
				instance.elements.uploaderResultElement = noJquery(instance.elements.containerElement).find(".uploader_result").get(0);
				instance.elements.uploaderResultWrapperElement = noJquery(instance.elements.containerElement).find(".uploader_result_wrapper").get(0);
				instance.elements.uploaderProgressContainerElement = noJquery(instance.elements.containerElement).find(".uploader_progress_container").get(0);
				instance.elements.uploaderProgressBarElement = noJquery(instance.elements.containerElement).find(".uploader_progress_bar").get(0);
				instance.elements.uploaderProgressBarPaddingElement = noJquery(instance.elements.containerElement).find(".uploader_progress_bar_padding").get(0);
				instance.elements.uploaderProgressBarTextElement = noJquery(instance.elements.containerElement).find(".uploader_progress_bar_text").get(0);
				instance.elements.uploaderProgressBarColorElement = noJquery(instance.elements.containerElement).find(".uploader_progress_container .uploader_progress_bar div div").get(0);
				instance.elements.uploaderCancelButton = noJquery(instance.elements.containerElement).find(".uploader_cancel").get(0);
				

				instance._internalVariables.buildFileInput ();
				instance._internalVariables.setProgressDisplay();
				instance._internalVariables.setShowFocusRect();
				instance._internalVariables.setText();
				instance._internalVariables.setDocumentEvents();
				instance._internalVariables.setDropFileEvents();
				instance._internalVariables.showCurrentFiles();
				noJquery(instance.elements.uploaderCancelButton).on("click", function () {
					instance.cancelUpload();
				});
				instance._internalVariables.validateIframeGatewayPath();
				
			} else {
				instance._internalVariables.consoleError("Can't create element inside 'form' tag.");
			}
			
		} else {
			instance._internalVariables.consoleError("Element not exist in DOM.");
		}
		
	};

	this._internalVariables.setShowFocusRect = function () {
		var instance = this.instance;
		if (instance.showFocusRect) {
			noJquery(instance.elements.containerElement).addClass("show_focus_rect");
		} else {
			noJquery(instance.elements.containerElement).removeClass("show_focus_rect");
		}
	};

	this._internalVariables.setHeight = function () {
		var instance = this.instance;
		var curHeight = instance.height;
		if (instance.progressAnimationType.indexOf("bar") != -1) {
			curHeight -= 25;
		}
		if (!instance.customHTML) {
			noJquery(instance.elements.containerElement).css("min-height", instance.height+"px");
		}
		noJquery(instance.elements.uploaderDropAreaWrapper).css("height", curHeight+"px");
		//noJquery(instance.elements.uploaderResultWrapperElement).css("min-height", curHeight+"px");
		noJquery(instance.elements.uploaderResultWrapperElement).css("height", curHeight+"px");
	};

	this._internalVariables.setProgressDisplay = function () {

		var instance = this.instance;
		if (instance.elements.containerElement != null) {
			if (instance.progressAnimationType == null) {
				instance.progressAnimationType = "";
			}
		    if (instance.progressAnimationType.indexOf("bar") != -1) {
		        noJquery(instance.elements.containerElement).addClass("loading_bar");
		        if (instance._internalVariables.isUploading && instance.elements.uploaderProgressContainerElement != null) {
		        	noJquery(instance.elements.uploaderProgressContainerElement).css("display", "");
		        }
		    } else {
		    	noJquery(instance.elements.containerElement).removeClass("loading_bar");
		        if (instance.elements.uploaderProgressContainerElement != null) {
			    	noJquery(instance.elements.uploaderProgressContainerElement).css("display", "none");
			    }
		    }

		    if (instance.elements.uploaderDropAreaBottomLayerElement != null) {
				if (instance.progressAnimationType.indexOf("inline") != -1 && instance._internalVariables.isUploading
					&& (instance._internalVariables.getUploadType() == "chunks" || instance._internalVariables.getUploadType() == "stream")) {
					noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("display", "");
					noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).css("display", "");
				} else {
					noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("display", "none");
					noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).css("display", "none");
				}
		    }

		}
		instance._internalVariables.setHeight();

	}

	this._internalVariables.validateFiles = function () {

		var instance = this.instance;
		var errors = [];
    	for (var i=0; i<instance._internalVariables.curUploadingFilesData.length; i++) {
    		var fileData = instance._internalVariables.curUploadingFilesData[i];
    		var fileName = fileData.name;
    		var fileExtension = fileData.extension;
    		var fileSize = fileData.size/1024;
    		
    		if(instance.allowedFilesExtensions != null && instance.allowedFilesExtensions.length > 0 && noJquery.inArray(fileExtension.toLowerCase(), instance.allowedFilesExtensions) == -1){
    			errors.push({error: 'invalid_file_extension', file: fileData});
    		} else if (instance.allowedMaxFileSize != null && instance.allowedMaxFileSize > 0 && fileSize > instance.allowedMaxFileSize) {
    			errors.push({error: 'invalid_file_size', file: fileData});
    		}

    		if (errors.length == 0 && instance.allowedMaxFileSize != null && instance.allowedMaxFileSize > 0) {
    			var ieVersion = instance._internalVariables.getIEVersion();
    			if (ieVersion > 0 && ieVersion <= 9) {
    				instance._internalVariables.consoleError("Size validation is not possible on IE9 and below");
    			}
    		}

    		if (typeof(instance.customValidation) == "function") {
    			var result = instance.customValidation(fileData);
    			if (result != null) {
    				result.file = fileData.file;
    				errors.push(result);
    			}
    		}
    	}
    	return errors;

	}

	this._internalVariables.buildFileInput = function () {
	    
		var instance = this.instance;
		noJquery(instance.elements.uploaderDropAreaElement).find(".input_wrapper").remove();
		noJquery(instance.elements.uploaderDropAreaElement).append( noJquery("<div class='input_wrapper'><input name='"+instance.elements.elementId+"_input' type='file' "+((instance.maxFiles > 1) ? "multiple" : "")+" /></div>")[0] );

	    var filesUpload = noJquery(instance.elements.containerElement).find("input")[0];
	    if (filesUpload != null) {
	        filesUpload.onchange = function () {

	        	instance._internalVariables.onChangeTriggered = true;
	        	var curFiles = this.files;
	        	if (curFiles == null) { // IE8
	        		var curFile = {};
	        		var fileName = this.value;
	        		if (fileName != null && fileName != "") {
	        			if (fileName.indexOf("/") != -1) {
	        				fileName = fileName.substr(fileName.lastIndexOf("/")+1)
	        			}
	        			if (fileName.indexOf("\\") != -1) {
	        				fileName = fileName.substr(fileName.lastIndexOf("\\")+1)
	        			}
	        			curFile.name = fileName;
	        		}
	        		curFiles = [curFile];
	        	}

				noJquery(instance.elements.uploaderDropAreaElement).find("input").css("display", "none");
	        	
	            if (!instance._internalVariables.isUploading) {

	                if (curFiles) {
	                    instance._internalVariables.curUploadingFilesData = [];
	                    for (var i=0; i<curFiles.length; i++) {
	                    	var curFile = curFiles[i];
	                    	instance._internalVariables.curUploadingFilesData.push (new FileData(curFile));
	                    }
			            instance._internalVariables.totalFilesToUpload = Math.min(curFiles.length, instance.maxFiles);
	                    instance._internalVariables.traverseFiles();
	                }
	            }

	        	setTimeout(function () {
	        		instance._internalVariables.onChangeTriggered = false;
	        	}, 1);
	        }

	        filesUpload.onmouseover = function () {
	            instance._internalVariables.hoverOnBtn = true;
	            instance._internalVariables.checkDragFileStates ();
	        }
	        filesUpload.onmouseout = function () {
	            instance._internalVariables.hoverOnBtn = false;
	            instance._internalVariables.checkDragFileStates ();
	        }

	    }
		instance.elements.uploaderInputElement = noJquery(instance.elements.containerElement).find("input")[0];
		instance.elements.uploaderInputElement.onfocus = function(){
			noJquery(instance.elements.containerElement).addClass("focused");
		}
		instance.elements.uploaderInputElement.onblur = function(){
			noJquery(instance.elements.containerElement).removeClass("focused");
		}
	    instance._internalVariables.setVariable("acceptOnlyFilesTypes");
	    instance._internalVariables.setVariable("showUploadedFiles");
	    instance._internalVariables.setVariable("disabled");
	    instance._internalVariables.setVariable("rtl");
	    instance._internalVariables.checkDragFileStates ();

	}

	this._internalVariables.showUploadBtn = function () {

		var instance = this.instance;
		noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("display", "none");
		noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).css("display", "none");
		noJquery(instance.elements.containerElement).removeClass("uploading");
        noJquery(instance.elements.containerElement).find("input").attr("onclick", "");
        instance._internalVariables.setText();
		instance._internalVariables.buildFileInput ();
		noJquery(instance.elements.uploaderProgressContainerElement).css("display", "none");
		noJquery(instance.elements.uploaderProgressBarColorElement).css("width", "0%");
		noJquery(instance.elements.uploaderCancelButton).css("display", "none");

	}

	//
	//
	//	Events Handler
	//
	//

	this._internalVariables.setDropFileEvents = function () {

		var instance = this.instance;
		if (instance.elements.uploaderDropAreaElement != null) {
			
			noJquery(instance.elements.uploaderDropAreaElement).unbind ("dragleave");
			noJquery(instance.elements.uploaderDropAreaElement).unbind ("dragenter, dragover");
			noJquery(instance.elements.uploaderDropAreaElement).unbind ("drop");
			
			if (instance._internalVariables.isDropFilesEnabled()) {
				noJquery(instance.elements.uploaderDropAreaElement).on("dragleave", function (evt) {
					if (!instance.disabled) {
						instance._internalVariables.draggedOnBtn = false;
						instance._internalVariables.checkDragFileStates ();
						evt.preventDefault();
						evt.stopPropagation();
					}
				});
				
				noJquery(instance.elements.uploaderDropAreaElement).on ("dragenter, dragover", function (evt) {
					if (!instance.disabled && !instance._internalVariables.isUploading && instance._internalVariables.isDropFilesEnabled()) {
						if (evt.originalEvent.dataTransfer.types[0] == "Files" || evt.originalEvent.dataTransfer.types[0] == "text/uri-list" || evt.originalEvent.dataTransfer.types[0] == "application/x-moz-file") {
							instance._internalVariables.draggedOnBtn = true;
							instance._internalVariables.checkDragFileStates ()
							evt.preventDefault();
							evt.stopPropagation();
						}
					}
				});
				
				noJquery(instance.elements.uploaderDropAreaElement).on ("drop", function (evt) {
					if (!instance.disabled && !instance._internalVariables.isUploading && instance._internalVariables.isDropFilesEnabled()) {
						instance._internalVariables.draggedOnBtn = false;
						instance._internalVariables.draggedOnDocument = false;
						instance._internalVariables.checkDragFileStates ();
						var curFiles = evt.originalEvent.dataTransfer.files;

			            instance._internalVariables.curUploadingFilesData = [];
	                    for (var i=0; i<curFiles.length; i++) {
	                    	var curFile = curFiles[i];
	                    	instance._internalVariables.curUploadingFilesData.push (new FileData(curFile));
	                    }

			            instance._internalVariables.totalFilesToUpload = Math.min(curFiles.length, instance.maxFiles);
			            noJquery(instance.elements.uploaderDropAreaElement).find("input").css("display", "none");

			            if (instance._internalVariables.getUploadType() == "iframe") {

				        	noJquery(instance.elements.uploaderDropAreaElement).find("input")[0].files = evt.originalEvent.dataTransfer.files;
				        	// Triggers "onchange"
				        	if (!instance._internalVariables.onChangeTriggered) { // Firefox don't trigger onchange when setting the input value
				        		setTimeout(function () {

				        			try {
										var event = new Event('change');
										noJquery(instance.elements.uploaderDropAreaElement).find("input")[0].dispatchEvent(event);
				        			} catch (e) {

				        			}

				        		}, 1);
				        	}
				        } else {
				        	instance._internalVariables.traverseFiles();
				        }
						evt.preventDefault();
						evt.stopPropagation();
					}
				});
				
			}
		}

	}

	this._internalVariables.setDocumentEvents = function () {

		var instance = this.instance;
		if (instance._internalVariables.isDropFilesEnabled()) {

			document.addEventListener("mousemove", function (evt) {
				instance._internalVariables.curMouseX = evt.clientX;
				instance._internalVariables.curMouseY = evt.clientY;
			}, false);

			document.addEventListener("dragover", function (evt) {
				if (!instance.disabled) {
					if (evt.dataTransfer.types[0] == "Files" || evt.dataTransfer.types[0] == "text/uri-list" || evt.dataTransfer.types[0] == "application/x-moz-file") {
						if (evt.dataTransfer){
							evt.dataTransfer.dropEffect = 'none';
							evt.preventDefault();
						}
					}
				}
			}, false);

			document.addEventListener("drop", function (evt) {
				if (!instance.disabled && !instance._internalVariables.isUploading && instance._internalVariables.isDropFilesEnabled()) {
					if (evt.dataTransfer.types[0] == "Files" || evt.dataTransfer.types[0] == "text/uri-list" || evt.dataTransfer.types[0] == "application/x-moz-file") {
						instance._internalVariables.draggedOnDocument = false;
						instance._internalVariables.draggedOnBtn = false;
						instance._internalVariables.checkDragFileStates ();
						evt.preventDefault();
						evt.stopPropagation();
					}
				}
			} , false);
			
			document.addEventListener("dragenter", function (evt) {
				if (!instance.disabled && !instance._internalVariables.isUploading && instance._internalVariables.isDropFilesEnabled()) {
					if (evt.dataTransfer.types[0] == "Files"  || evt.dataTransfer.types[0] == "text/uri-list" || evt.dataTransfer.types[0] == "application/x-moz-file") {
						instance._internalVariables.draggedOnDocument = true;
						instance._internalVariables.checkDragFileStates ();
					}
				}
			} , false);
			
			noJquery("body").on("mouseleave", function(){
				instance._internalVariables.draggedOnDocument = false;
				instance._internalVariables.draggedOnBtn = false;
				if (!instance.disabled && !instance._internalVariables.isUploading && instance._internalVariables.isDropFilesEnabled()) {
					instance._internalVariables.checkDragFileStates ();
				}
			});
			setInterval(instance._internalVariables.checkMousePosition, 100, instance);

		}

	}

	this._internalVariables.checkDragFileStates = function () {

		var instance = this.instance;
		if (instance.elements.containerElement != null) {

			if (!instance.disabled && !instance._internalVariables.isUploading) {
				
				noJquery(instance.elements.containerElement).removeClass("dragged_enter");
				noJquery(instance.elements.containerElement).removeClass("dragged_over");
				noJquery(instance.elements.containerElement).removeClass("hover");
				noJquery(instance.elements.containerElement).removeClass("uploading");

				if (instance._internalVariables.draggedOnBtn) {
					noJquery(instance.elements.containerElement).addClass("dragged_over");
				} else if (instance._internalVariables.draggedOnDocument) {
					noJquery(instance.elements.containerElement).addClass("dragged_enter");
				} else if (instance._internalVariables.hoverOnBtn) {
					noJquery(instance.elements.containerElement).addClass("hover");
				}
				
			}
			
		}
		instance._internalVariables.setText();
		
	}

    this._internalVariables.checkMousePosition = function (instance) {

		if (Math.abs(instance._internalVariables.curMouseX-instance._internalVariables.lastMouseX) > 5 || Math.abs(instance._internalVariables.curMouseY-instance._internalVariables.lastMouseY) > 5) {
			instance._internalVariables.draggedOnDocument = false;
			instance._internalVariables.checkDragFileStates();
		}
		instance._internalVariables.lastMouseX = instance._internalVariables.curMouseX;
		instance._internalVariables.lastMouseY = instance._internalVariables.curMouseY;
	}

	//
	//
	//	Texts Handler
	//
	//

	this._internalVariables.setText = function () {

		var instance = this.instance;
		if (instance.elements.containerElement != null && instance.elements.uploaderTextElement != null) {

			var curText = "";
			if (!instance.disabled && !instance._internalVariables.isUploading) {
				
				if (instance._internalVariables.draggedOnBtn) {
					curText = instance.dropFilesText;
					//noJquery(instance.elements.uploaderTextElement).find('span').html(instance.dropFilesText);
				} else if (instance._internalVariables.draggedOnDocument) {
					curText = instance.dropFilesText;
					//noJquery(instance.elements.uploaderTextElement).find('span').html(instance.dropFilesText);
				} else if (instance._internalVariables.hoverOnBtn) {
					curText = instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled;
					//noJquery(instance.elements.uploaderTextElement).find('span').html(instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled);
				} else {
					curText = instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled;
					//noJquery(instance.elements.uploaderTextElement).find('span').html(instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled);
				}
				noJquery(instance.elements.uploaderTextElement).find('.uploader_spinner').css("display", "none");

			} else if (instance._internalVariables.isUploading) {
				curText = instance._internalVariables.getUploadingText();
        		//noJquery(instance.elements.uploaderTextElement).find('span').html(instance._internalVariables.getUploadingText());
        		noJquery(instance.elements.uploaderTextElement).find('.uploader_spinner').css("display", "");
			} else {
				curText = instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled;
				//noJquery(instance.elements.uploaderTextElement).find('span').html(instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled);
        		noJquery(instance.elements.uploaderTextElement).find('.uploader_spinner').css("display", "none");
			}
			noJquery(instance.elements.uploaderTextElement).find('span').html(curText);
			noJquery(instance.elements.uploaderInputElement).attr('aria-label', curText);
			noJquery(instance.elements.uploaderCancelButton).find('span').html(instance.cancelText);

		}

	}

	this._internalVariables.getUploadingText = function () {


		var instance = this.instance;
        var text = "";
        var totalFiles = Math.min(instance._internalVariables.curUploadingFilesData.length, instance.maxFiles);
        if (instance._internalVariables.getUploadType() == "chunks" || instance._internalVariables.getUploadType() == "stream") {

	        if (instance._internalVariables.curUploadingFilesData == null || instance._internalVariables.curUploadingFilesData.length <= 1 || instance.maxFiles == 1) {
	            text = instance.uploadingFileText;
	        } else {
	            text = instance.uploadingFileByFileText;
	        }

	    } else {
	    	if (totalFiles == 1) {
	    		text = instance.uploadingFileText;
	    	} else {
	    		text = instance.uploadingFilesText;
	    	}
		}

        text = text.split("{{current_file_index}}").join(instance._internalVariables.curUploadingFileIndex+1);
        if (instance._internalVariables.curUploadingFilesData.length > instance._internalVariables.curUploadingFileIndex) {
			text = text.split("{{current_file_name}}").join(instance._internalVariables.getShortFilename(instance._internalVariables.curUploadingFilesData[instance._internalVariables.curUploadingFileIndex].name));
        } else {
        	text = text.split("{{current_file_name}}").join("");
        }
        text = text.split("{{total_files}}").join(totalFiles);
        return text;
    	
    }

	this._internalVariables.getShortFilename = function (filename) {

		var instance = this.instance;
		var filenameName = filename;
		filenameName = filenameName.substring(filenameName.lastIndexOf("/")+1, filenameName.length);
		filenameName = filenameName.substring(filenameName.lastIndexOf("\\")+1, filenameName.length);
		filenameName = filenameName.substring(0, filenameName.lastIndexOf("."));
		var filenameExt = filename.substring(filename.lastIndexOf("."), filename.length);
		if (filenameName.length+filenameExt.length+1 > instance.maxFileChars) {
			filenameName = filenameName.substring(0, instance.maxFileChars-3-filenameExt.length)+"...";
		}
		return filenameName+filenameExt;

	}

	//
	//
	//	Upload Functions
	//
	//

    this._internalVariables.traverseFiles = function () {

		var instance = this.instance;
		if (typeof instance._internalVariables.curUploadingFilesData !== "undefined" && instance._internalVariables.curUploadingFilesData.length > 0) {

        	if (instance.resetFilesOnEachUpload) {
            	instance.uploadedFiles = [];
        	}
            instance._internalVariables.curUploadingFileIndex = 0;
            instance._internalVariables.getFilesMetadata ();

		}

	}

	this._internalVariables.getFilesMetadata = function () {

		var instance = this.instance;
		instance._internalVariables.getNextFileMetadata();

	}

	this._internalVariables.getNextFileMetadata = function () {

		var instance = this.instance;
	    var file = instance._internalVariables.curUploadingFilesData[instance._internalVariables.curUploadingFileIndex].file;
	    
	    var fileName = file.name;
	    if (fileName == null) {
	    	fileName = "";
	    }
		var metadata = {
			file: file,
			name: fileName,
			size: file.size,
			extension: fileName.substr(fileName.lastIndexOf(".")+1, 5),
			type: file.type,
			width: null,
			height: null,
			rotation: null,
			duration: null
		};

		if(instance._internalVariables.isImg(file.name) && instance.doGetFileMetadata) {

			if (typeof(FileReader) != "undefined") {

				setTimeout(function () { // Using timeout because geting exif might be heavy
					var reader = new FileReader();
					var image;

					var metadataFailedTimeout = setTimeout(function () {
						reader.onload = null;
						if (image != null) {
							image.onload = null;
						}
						instance._internalVariables.consoleError("Failed retrieving meta data for '"+fileName+"'");
						instance._internalVariables.getFileMetaFinished (file, metadata);
					}, 400);

			  		reader.onload = function (event) {
			  			instance._internalVariables.getOrientation(event.target.result, function (orientation) {
			  				var imageRotation = 0;
							if (orientation > 0) {
								if (orientation == 5 || orientation == 6) {
									imageRotation = 90;
								} else if (orientation == 3 || orientation == 4) {
									imageRotation = 180;
								} else if (orientation == 7 || orientation == 8) {
									imageRotation = 270;
								}
							}
							metadata.rotation = imageRotation;
			  			});
			  		}
			  		reader.onloadend = function (event) {
			  			var image = new Image();
		  			    var bytes = new Uint8Array(event.target.result);
		  			    var blob = new Blob([bytes.buffer]);
						image.src = URL.createObjectURL(blob);

					    //image.src = event.target.result;
					    image.onload = function() {
							clearTimeout(metadataFailedTimeout);
					        metadata.width = this.width;
					        metadata.height = this.height;
			  				instance._internalVariables.getFileMetaFinished (file, metadata);
					    };
			  		}
			  		reader.readAsArrayBuffer(file);
			  		//reader.readAsDataURL(file);
		  		}, 2);

			} else {
				instance._internalVariables.consoleError("Can't get Exif data since browser doesn't support FileReader");
				instance._internalVariables.getFileMetaFinished (file, metadata);
			}
			
		} else if (instance._internalVariables.isVideo(file.name) && instance.doGetFileMetadata) {

			if (typeof(FileReader) != "undefined") {
				
				var video = document.createElement('video');
				video.preload = 'metadata';
				var metadataFailedTimeout = setTimeout(function () {
					video.onloadedmetadata = null;
					instance._internalVariables.consoleError("Failed retrieving meta data for '"+fileName+"'");
					instance._internalVariables.getFileMetaFinished (file, metadata);
				}, 400);
				video.onloadedmetadata = function() {
					clearTimeout(metadataFailedTimeout);
					window.URL.revokeObjectURL(video.src);
					var height = null;
					var width = null;
					if (video.width != null && video.width > 0) {
						width = video.width;
					}
					if (video.videoWidth != null && video.videoWidth > 0) {
						width = video.videoWidth;
					}
					if (video.height != null && video.height > 0) {
						height = video.height;
					}
					if (video.videoHeight != null && video.videoHeight > 0) {
						height = video.videoHeight;
					}
			        metadata.duration = video.duration;
			        metadata.width = width;
			        metadata.height = height;
	  				instance._internalVariables.getFileMetaFinished (file, metadata);
				}

				video.src = URL.createObjectURL(file);

			} else {
				instance._internalVariables.consoleError("Can't get file meta data since browser doesn't support FileReader");
				instance._internalVariables.getFileMetaFinished (file, metadata);
			}

		} else {
			
			instance._internalVariables.getFileMetaFinished (file, metadata);
			
		}
		
	}

	this._internalVariables.getFileMetaFinished = function (file, fileMetadata) {

		var instance = this.instance;
		var curFileData = instance._internalVariables.curUploadingFilesData[instance._internalVariables.curUploadingFileIndex];
		curFileData.duration = fileMetadata.duration || null;
		curFileData.width = fileMetadata.width || null;
		curFileData.height = fileMetadata.height || null;
		curFileData.rotation = fileMetadata.rotation || null;
		var isLastFile = (instance._internalVariables.curUploadingFilesData.length <= instance._internalVariables.curUploadingFileIndex+1) || (instance._internalVariables.curUploadingFileIndex+1 >= instance.maxFiles);
		if (isLastFile) {

			var errors = instance._internalVariables.validateFiles();
			if (errors.length == 0) {
				if (typeof (instance.onFilesSelected) == "function") {
	        		instance.onFilesSelected (instance._internalVariables.curUploadingFilesData);
	        	}
				instance._internalVariables.curUploadingFileIndex = 0;
				instance._internalVariables.onFileProgress (0);
				instance._internalVariables.uploadFile ();
			} else {
	    		instance._internalVariables.parseErrors(errors);
	    	}

		} else {
			instance._internalVariables.curUploadingFileIndex ++;
			instance._internalVariables.getNextFileMetadata();
		}

	}

	this._internalVariables.uploadFile = function () {

		var instance = this.instance;

		noJquery(instance.elements.uploaderDropAreaBottomLayerElement).find("img").attr("src", "");
		noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).find("img").attr("src", "");
		noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("transition", "width 0s");
		noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("-webkit-transition", "width 0s");
		noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("width", 0);
		setTimeout(function () {
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("transition", "width .2s");
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("-webkit-transition", "width .2s");
		}, 10);

		if (instance.progressAnimationType.indexOf("bar") != -1) {
			noJquery(instance.elements.uploaderProgressContainerElement).css("display", "");
		}
		if (instance._internalVariables.getUploadType() == "iframe") {
			noJquery(instance.elements.uploaderProgressBarElement).find("div").css("display", "none");
			noJquery(instance.elements.uploaderProgressBarTextElement).css("width", "auto");
			noJquery(instance.elements.uploaderProgressBarPaddingElement).css("display", "none");
		} else {
			noJquery(instance.elements.uploaderProgressBarElement).find("div").css("display", "");
			noJquery(instance.elements.uploaderProgressBarTextElement).css("width", "1%");
			noJquery(instance.elements.uploaderProgressBarPaddingElement).css("display", "");
		}
		noJquery(instance.elements.uploaderResultElement).removeClass("error");
		instance._internalVariables.showCurrentFiles();
		var files = instance._internalVariables.curUploadingFilesData;
		var fileIndex = instance._internalVariables.curUploadingFileIndex;	
		var text = "";
		if (files.length > 1 && instance.maxFiles > 1) {
			text = instance.uploadingFilesTextProgressBar;
		} else {
			text = instance.uploadingFileTextProgressBar;
		}
		text = text.split("{{total_files}}").join(Math.min(instance._internalVariables.curUploadingFilesData.length, instance.maxFiles));
		text = text.split("{{current_file_name}}").join(instance._internalVariables.getShortFilename(files[fileIndex].name));
		noJquery(instance.elements.uploaderProgressBarTextElement).html(text);
		
		instance._internalVariables.isUploading = true;
		noJquery(instance.elements.uploaderCancelButton).css("display", "block");
		instance._internalVariables.setProgressDisplay();
	    noJquery(instance.elements.containerElement).find("input").attr("onclick", "return false;");

	    instance._internalVariables.setText();
		noJquery(instance.elements.containerElement).removeClass("dragged_enter");
		noJquery(instance.elements.containerElement).removeClass("dragged_over");
		noJquery(instance.elements.containerElement).removeClass("hover");
		noJquery(instance.elements.containerElement).addClass("uploading");

		noJquery(instance.elements.uploaderDropAreaBottomLayerElement).find("img").css("width", noJquery(instance.elements.uploaderDropAreaElement).outerWidth());
		noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).find("img").css("width", noJquery(instance.elements.uploaderDropAreaElement).outerWidth());
		var imgTempUrl = null;
		if (typeof(URL) != "undefined") {
			imgTempUrl = URL.createObjectURL(files[fileIndex].file);
		}

		if (imgTempUrl != null && imgTempUrl != "" && instance._internalVariables.isImg(files[fileIndex].name)) {
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).find("img").attr("src", imgTempUrl).css("display", "");
			noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).find("img").attr("src", imgTempUrl).css("display", "");
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("opacity", "0");
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).find("img").unbind("load");
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).find("img").on("load", function() {
				noJquery(this).parent().animate({opacity: 1}, 400);
			});
			noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).css("opacity", "0");
			noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).find("img").unbind("load");
			noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).find("img").on("load", function() {
				noJquery(this).parent().animate({opacity: 1}, 400);
			});
		} else {
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).find("img").attr("src", "").css("display", "none");
			noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).find("img").attr("src", "").css("display", "none");
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).animate({opacity: 1}, 400);
			noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).animate({opacity: 1}, 400);
		}
				
		var script = "";

		if (instance._internalVariables.getUploadType() == "chunks") {
			
			var fileData = instance._internalVariables.curUploadingFilesData[fileIndex];
			script = instance.serverScripts.uploadChunk+"&_="+Math.random();
	        var fileName = fileData.name;
	        var fileExtension = fileName.substr(fileName.lastIndexOf("."), 5);
			var blob = files[fileIndex].file;
            var completed = 0;
            var randomId = Math.floor(Math.random()*999999999);
            instance._internalVariables.uploadFileChunk (script, fileData, randomId, blob, 0, 0, instance._internalVariables.BYTES_PER_CHUNK);
            
		} else {

			if (instance._internalVariables.getUploadType() == "stream") {

		        var fileData = instance._internalVariables.curUploadingFilesData[fileIndex];
		        var fileName = fileData.name;
				var xhr = new XMLHttpRequest();
				instance._internalVariables.uploadFileChunkXhr = xhr;
				xhr.upload.addEventListener("progress", function (evt) {
					if (evt.lengthComputable) {
						instance._internalVariables.onFileProgress (evt.loaded / evt.total);
					} else {
					}
				}, false);

				xhr.addEventListener("load", function () {
					var result = xhr.responseText;
					
					try {

				        instance._internalVariables.curUploadingFileIndex ++;
				        var isLastFile = (instance._internalVariables.curUploadingFilesData.length <= instance._internalVariables.curUploadingFileIndex) || (instance._internalVariables.curUploadingFileIndex >= instance.maxFiles);
				        if (isLastFile) {
				        	//instance._internalVariables.curUploadingFileIndex = Math.min(instance._internalVariables.curUploadingFilesData.length, instance.maxFiles)-1;
				        	instance._internalVariables.curUploadingFileIndex --;
				        }

				        var jsonObj = JSON.parse(result);

				        function parseUploadResult () {

				        	instance._internalVariables.parseUploadResult (jsonObj, isLastFile, files[fileIndex].file);
				        	
				            if (!isLastFile && instance._internalVariables.curUploadingFilesData.length > 0) {
				                instance._internalVariables.uploadFile ();
				            }
				        }
				        
				        if (instance.elements.uploaderDropAreaBottomLayerElement != null) {
						    noJquery(instance.elements.uploaderDropAreaBottomLayerElement).animate({opacity: 0}, 200, function () {
						    	parseUploadResult();
						    });
				        } else {
				        	parseUploadResult();
				        }
					    noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).animate({opacity: 0}, 200);

					} catch (err) {

						instance._internalVariables.consoleError(err);
						instance._internalVariables.setError('parse_failed', files[fileIndex], result);
			        	instance._internalVariables.uploadFileChunkXhr = null;

					}
					

				}, false);

				script = instance.serverScripts.uploadStream;
				script = script.split("{{file_name}}").join(fileName).split("{{rotation}}").join(fileData.rotation);
				script += "&_="+Math.random();

				xhr.open("post", script, true);
				xhr.setRequestHeader("Content-Type", "multipart/form-data");
				xhr.setRequestHeader("X-File-Name", fileName);
				//xhr.setRequestHeader("X-File-Size", fileData.size);
				xhr.setRequestHeader("X-File-Type", fileData.type);
				
				xhr.send(files[fileIndex].file);

			} else {

				var roation = "";
				for (var i=0; i<instance._internalVariables.curUploadingFilesData.length; i++) {
					roation += instance._internalVariables.curUploadingFilesData[i].rotation;
					if (i < instance._internalVariables.curUploadingFilesData.length-1) {
						roation += ",";
					}
				}

				script = instance.serverScripts.uploadThroughIframe;
				script = script.split("{{rotation}}").join(roation);
				//script += "&_="+Math.random();

				instance._internalVariables.onFileProgress (0);

				uploaerIframeGateway.uploadViaIframeGateway (
					instance.elements.elementId,
					script,
					instance._internalVariables.getIframeGatewayFullUrl(),
					function (data) {
						instance._internalVariables.curUploadingFileIndex = instance._internalVariables.totalFilesToUpload-1;
						instance._internalVariables.onFileProgress (1);
						if (instance.elements.uploaderDropAreaBottomLayerElement == null) {
							instance._internalVariables.parseUploadResult (data, true, null);
						} else {
							noJquery(instance.elements.uploaderDropAreaBottomLayerElement).animate({opacity: 0}, 200, function () {
								instance._internalVariables.parseUploadResult (data, true, null);
							});
						}
						noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).animate({opacity: 0}, 200, function () {
						});

					}
				);

			}


		}
		
	}

	this._internalVariables.uploadFileChunk = function (script, file, uploaderId, blob, index, start, end) {

		var instance = this.instance;
		var SIZE = blob.size;
		var chunk;
    	if (blob.slice) {
	    	chunk = blob.slice(start, end);
	    } else if (blob.mozSlice) {
	    	chunk = blob.mozSlice(start, end);
	    } else if (blob.webkitSlice) {
	    	chunk = blob.webkitSlice(start, end);
	    }

        var xhr = new XMLHttpRequest();
        instance._internalVariables.uploadFileChunkXhr = xhr;
        xhr.onload = function () {
        };
		xhr.onerror = function () {
		};
		xhr.onreadystatechange = function (oEvent) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {

					var hasError = false;
					try {

						var result = JSON.parse(this.response);
						if (Array.isArray(result)) {

							for (var i=0; i<result.length; i++) {
								if (result[i][instance.serverScripts.errorVariableName] != null && result[i][instance.serverScripts.errorVariableName] != "") {
									instance._internalVariables.setError('upload_failed', file, result[i]);
									hasError = true;
									break;
								}
							}
							
						} else if (typeof(result) == "object") {

							if (result[instance.serverScripts.errorVariableName] != null && result[instance.serverScripts.errorVariableName] != "") {
								instance._internalVariables.setError('upload_failed', file, result);
								hasError = true;
							}

						} else {
							instance._internalVariables.setError('parse_failed', file, null);
							hasError = true;
						}

					} catch (err) {
						instance._internalVariables.consoleError(err);
					}

					if (hasError) {
						instance._internalVariables.abortAndCancelUpload();
					} else {
						var count = SIZE % instance._internalVariables.BYTES_PER_CHUNK == 0 ? SIZE / instance._internalVariables.BYTES_PER_CHUNK : Math.floor(SIZE / instance._internalVariables.BYTES_PER_CHUNK) + 1;
			            if (instance._internalVariables.onFileProgress != null && typeof(instance._internalVariables.onFileProgress) == "function") {
							instance._internalVariables.onFileProgress (index/count);
						}
			            if (index == count) {
							instance._internalVariables.uploadFileChunkXhr = null;
			            	instance._internalVariables.uploadFileInChunksComplete(file, uploaderId);
			            } else {
					        start = end;
					        end = start + instance._internalVariables.BYTES_PER_CHUNK;
			        		index ++;
			        		if (instance._internalVariables.isUploading) {
			        			instance._internalVariables.uploadFileChunk (script, file, uploaderId, blob, index, start, end);
			        		}
			            }
					}

		        } else if (xhr.status === 0) {
		        	// aborted
				} else {
					var errors = [];
		        	errors.push({error: 'upload_failed', file: file});
					instance._internalVariables.parseErrors(errors);
				}  
			}
		};
		var scriptToPost = script.split("{{file_name}}").join(file.name).split("{{chunk_index}}").join(index).split("{{request_id}}").join(uploaderId);
		xhr.open("POST", scriptToPost);
        xhr.send(chunk);

	}

	this._internalVariables.uploadFileInChunksComplete = function (file, uploaderId) {

		var instance = this.instance;
		var script = instance.serverScripts.combineChunks.split("{{file_name}}").join(file.name).split("{{request_id}}").join(uploaderId).split("{{rotation}}").join(file.rotation);

		instance._internalVariables.uploadFileChunkXhr = noJquery.ajax ({
			url: script,
			dataType: 'jsonp',
			success: function(data) {

				instance._internalVariables.curUploadingFileIndex ++;
	            var isLastFile = (instance._internalVariables.curUploadingFilesData.length <= instance._internalVariables.curUploadingFileIndex) || (instance._internalVariables.curUploadingFileIndex >= instance.maxFiles);
	            instance._internalVariables.parseUploadResult (data, isLastFile, file);
	            if (!isLastFile && instance._internalVariables.curUploadingFilesData.length > 0) {
	                instance._internalVariables.uploadFile ();
	            }
	        	instance._internalVariables.uploadFileChunkXhr = null;
			},
			error: function(jqXHR, exception) {
				if (exception === 'abort') {
				} else {
					instance._internalVariables.setError('upload_failed', file);
				}
	        	instance._internalVariables.uploadFileChunkXhr = null;
			}
		});

	};

	this._internalVariables.onFileProgress = function (progress) {

		var instance = this.instance;
		var totalFiles = Math.min(instance._internalVariables.curUploadingFilesData.length, instance.maxFiles);
		if (typeof(instance.onFilesProgress) == "function") {
			instance.onFilesProgress (progress, instance._internalVariables.curUploadingFileIndex, instance._internalVariables.totalFilesToUpload);
		}
		if (instance.progressAnimationType.indexOf("bar") != -1) {
			var eachFileProgress = 100/totalFiles;
			var curBarProgress = eachFileProgress*instance._internalVariables.curUploadingFileIndex+eachFileProgress*progress;
			noJquery(instance.elements.uploaderProgressBarColorElement).css("width", ((curBarProgress) + "%"));
		}
		if (instance.progressAnimationType.indexOf("inline") != -1) {
			var totalWidth = 100;
			var ieVersion = instance._internalVariables.getIEVersion();
			if (ieVersion >= 9 && ieVersion <= 10) { // For IE10 + IE9
				totalWidth = 99;
			}
			noJquery(instance.elements.uploaderDropAreaBottomLayerElement).css("width", Math.ceil(progress*totalWidth)+"%");
			noJquery(instance.elements.uploaderDropAreaMiddleLayerElement).css("width", noJquery(instance.elements.uploaderDropAreaElement).outerWidth());
		}

	}

	this.cancelUpload = function () {

		var instance = this;
		instance._internalVariables.abortAndCancelUpload();
    	if (typeof (instance.onCanceled) == "function") {
    		instance.onCanceled ();
    	}

	}

	this._internalVariables.abortAndCancelUpload = function () {

		var instance = this.instance;
		instance._internalVariables.curUploadingFilesData = [];
		if (instance._internalVariables.uploadFileChunkXhr != null) {
			instance._internalVariables.uploadFileChunkXhr.abort();
			instance._internalVariables.uploadFileChunkXhr = null;
		}
		instance._internalVariables.isUploading = false;
		instance._internalVariables.showUploadBtn();
    	if (instance._internalVariables.getUploadType() == "iframe") {
	    	uploaerIframeGateway.cancelUpload (instance.elements.elementId, instance._internalVariables.getIframeGatewayFullUrl());
	    }

	}

	//
	//
	//	Uplaod Results Handler
	//
	//

	this._internalVariables.parseUploadResult = function (result, isLastFile, file) {

		var instance = this.instance;
		var hasError = false;
		
		if (Array.isArray(result)) {

			for (var i=0; i<result.length; i++) {
				if (result[i][instance.serverScripts.fileNameVariableName] == null || result[i][instance.serverScripts.fileNameVariableName] == "") {
					instance._internalVariables.setError('upload_failed', file, result[i]);
					hasError = true;
					break;
				} else {
					instance.uploadedFiles.push (result[i]);
				}
			}

		} else if (typeof(result) == "object") {
			
			if (result[instance.serverScripts.fileNameVariableName] == null || result[instance.serverScripts.fileNameVariableName] == "") {
				instance._internalVariables.setError('upload_failed', file, result);
				hasError = true;
			} else {
				instance.uploadedFiles.push (result);
			}

		} else {

			instance._internalVariables.setError('parse_failed', file, null);
			hasError = true;

		}

	    if (isLastFile && !hasError) {

	        instance._internalVariables.isUploading = false;
	    	if (typeof (instance.onFilesUploaded) == "function") {
        		instance.onFilesUploaded (instance.uploadedFiles);
        	}
	    	instance._internalVariables.showCurrentFiles();
			instance._internalVariables.showUploadBtn();
	    }
		
	}

	this._internalVariables.showCurrentFiles = function() {

		var instance = this.instance;
		if (instance.elements.uploaderResultElement != null) {

			clearTimeout(instance._internalVariables.displayErrorAnimationTimeoutDuration);
			var deleteBtnStr = "<a class='uploader_delete_btn' data-index='{{index}}' href='javascript: void(0);'><div></div></a>";
		    if (instance.uploadedFiles == null || instance.uploadedFiles.length == 0) {
		    	noJquery(instance.elements.uploaderResultElement).html("");
		    } else {

		    	var filesListHtml = "";
		    	for (var i=0; i<instance.uploadedFiles.length; i++) {
		    		var fileObj = instance.uploadedFiles[i];
					if (fileObj[instance.serverScripts.fileNameVariableName] != null && fileObj[instance.serverScripts.fileNameVariableName] != "") {
						var fileNameStr = instance.uploadedFileHtml;
						if (typeof(fileNameStr) == "undefined") {
							fileNameStr = "";
						}
						fileNameStr = fileNameStr.split("{{current_file_path}}").join(fileObj[instance.serverScripts.fileUrlVariableName]).split("{{current_file_name}}").join(instance._internalVariables.getShortFilename(fileObj[instance.serverScripts.fileNameVariableName]))
						filesListHtml += "<div class='uploader_result_file'>"+deleteBtnStr.split("{{index}}").join(i)+"&nbsp;"+fileNameStr+"</div>";
			        }
		    	}
		    	noJquery(instance.elements.uploaderResultElement).html(filesListHtml);

		    }

		    var deleteBtns = instance.elements.containerElement.querySelectorAll(".uploader_delete_btn");
		    for (var i=0; i<deleteBtns.length; i++) {
		        noJquery(deleteBtns.item(i)).on("click", function () {
		        	if (!instance.disabled) {
		            	instance._internalVariables.deleteFile (noJquery(this).attr("data-index"));
		        	}
		        });
		    }
	        noJquery(instance.elements.uploaderResultElement).fadeIn();
		}
		
	}

	this._internalVariables.deleteFile = function (index) {

		var instance = this.instance;
	    var indexNum = parseInt(index);
	    var deletedFile = instance.uploadedFiles.splice(index, 1);

	    if (typeof (instance.onFileDeleted) == "function") {
    		instance.onFileDeleted (deletedFile[0], instance.uploadedFiles);
    	}

	    instance._internalVariables.showCurrentFiles();

	}

	this._internalVariables.setError = function (error, file, errorObject) {

		var instance = this.instance;
		var errors = [];
    	errors.push({error: error, file: file, error_object: errorObject});
		instance._internalVariables.parseErrors(errors);

	}

	this._internalVariables.parseErrors = function (errors) {

		var instance = this.instance;
		var errorStr = "";
		for (var i=0; i<errors.length; i++) {
			var curError = errors[i];
			var curErrorText;
			if (curError.error == "invalid_file_extension" || (curError.error_object != null && curError.error_object.error == "invalid_file_extension")) {
				curErrorText = instance.errors.invalidFileExtension;
			} else if (curError.error == "invalid_file_size" || (curError.error_object != null && curError.error_object.error == "invalid_file_size")) {
				curErrorText = instance.errors.invalidFileSize;
			} else if (curError.error == "parse_failed" || (curError.error_object != null && curError.error_object.error == "parse_failed")) {
				curErrorText = instance.errors.parseFailed;
			} else if (curError.error == "upload_failed") {

				if (instance.showDetailedErrorFromServer && curError.error_object != null && curError.error_object.error != null && curError.error_object.error != "") {
					curErrorText = curError.error_object.error;
				} else {
					curErrorText = instance.errors.uploadFailed;
				}

			} else if (curError.error_text != null) {
				curErrorText = curError.error_text;
			} else {
				curErrorText = instance.errors.unspecifiedError;
			}
			if (curErrorText != null) {
				var curErrorFile = curError.file;
				if (curErrorFile != null) {
					curErrorText = curErrorText.split("{{file_name}}").join(instance._internalVariables.getShortFilename(curErrorFile.name));
				}
				curError.error_text = curErrorText;
				if (errorStr != "") {
					errorStr += "<br>";
				}
				errorStr += curErrorText;
			}
		}
		noJquery(instance.elements.uploaderResultElement).addClass("error");
		//$(instance.elements.uploaderResultElement).html(errorStr).stop().css("display", "none").fadeIn();
		noJquery(instance.elements.uploaderResultElement).html(errorStr).css("opacity", "0").fadeIn();

		instance._internalVariables.abortAndCancelUpload();
		if (typeof (instance.onError) == "function") {
    		instance.onError (errors);
    	}
	    instance._internalVariables.hoverOnBtn = false;
    	instance._internalVariables.checkDragFileStates();
    	clearTimeout(instance._internalVariables.displayErrorAnimationTimeoutDuration);
    	instance._internalVariables.displayErrorAnimationTimeoutDuration = setTimeout(function () {
    		noJquery(instance.elements.uploaderResultElement).fadeOut(function () {
    			instance._internalVariables.showCurrentFiles();
    		});
    	}, instance.displayErrorDuration);
		
	}

	//
	//
	//	Utils
	//
	//
	
	this._internalVariables.consoleError = function (errorText) {
		
		var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
		var isIE = navigator.userAgent.indexOf("MSIE") != -1;

		var callerFunction = "";
        if (arguments != null && arguments.callee != null && arguments.callee.caller != null) {
            callerFunction = arguments.callee.caller.toString()
        }
        if (callerFunction == null || callerFunction == "") {
            if (this._internalVariables.consoleError.caller != null) {
                callerFunction = this._internalVariables.consoleError.caller.toString()
            }
        }
        if (callerFunction != null && callerFunction != "") {
        //	errorText += " (from: "+callerFunction+")";
        }

		if (typeof(console) != "undefined") {
			if (isIE11 || isIE) {
				console.warn ("Uploader: "+errorText);
			} else {
				console.log ("%c Uploader: "+errorText, 'background: #222; color: #bada55; padding: 10px;');
			}
		}

	}

	this._internalVariables.getUploadType = function () {

		var instance = this.instance;
		if (instance._internalVariables.canUploadFileInchunks()) {
			
			if (instance._internalVariables.isCrossDomainScript(instance.serverScripts.uploadStream)) {
				return "chunks";
			} else {
				var isEdge = navigator.userAgent.indexOf("Edge") > -1;
				if (isEdge) { // Edge progress event isn't possible with Stream (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12224510/)
					return "chunks";
				} else {
					return "stream";
				}
				
			}
			
		} else {
			var ieVersion = instance._internalVariables.getIEVersion();
			if (instance._internalVariables.isCrossDomainScript(instance.serverScripts.uploadStream)
				|| (ieVersion >= 0 && ieVersion <= 9)) { // IE 9 and below
				return "iframe";
			} else {
				return "stream";
			}
		}

	}

	this._internalVariables.canUploadFileInchunks = function () {

		var instance = this.instance;
		if (!instance.uploadFileInChunks) {
			return false;
		}
		var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		if (isSafari && instance._internalVariables.isCrossDomainScript(instance.serverScripts.uploadChunk)) {
			return false;
		}
		var ieVersion = instance._internalVariables.getIEVersion();
        if (ieVersion >= 0 && ieVersion <= 9) { // IE 9 and below
        	return false;
        }
		return true;

	}

	this._internalVariables.isCrossDomainScript = function (scriptToTest) {

		var instance = this.instance;
		var isCrossDomain = false;
		if (scriptToTest.indexOf("http:") == 0 || scriptToTest.indexOf("https:") == 0 || scriptToTest.indexOf("//") == 0) {

			var domain = "";
			if (scriptToTest.indexOf("://") > -1) {
		        domain = scriptToTest.split('/')[2];
		    } else if (scriptToTest.indexOf("//") == 0) {
		    	scriptToTest = scriptToTest.substring(2);
		        domain = scriptToTest.split('/')[0];
		    } else {
		        domain = scriptToTest.split('/')[0];
		    }
		    domain = domain.split(':')[0];
		    if (domain.toLowerCase() != window.location.host.toLowerCase()) {
		    	isCrossDomain = true;
		    }

		}
		
		return isCrossDomain;

	}

	this._internalVariables.getIEVersion = function () {

		var ieVersion = -1;
		if (navigator.appVersion.indexOf("MSIE") != -1) {
            ieVersion = parseFloat(navigator.appVersion.split("MSIE")[1]);
        }
        if (!!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        	ieVersion = 11;
        }
        return ieVersion;

	}

	this._internalVariables.isMobileOrTablet = function() {

		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;

	};

	this._internalVariables.videoFileTypes = [".3gp2", ".3gpp", ".3gpp2", ".asf", ".asx", ".avi", ".flv", ".m4v", ".mkv", ".mov", ".mpeg", ".mpg", ".mpe", ".m1s", ".mpa", ".mp2", ".m2a", ".mp2v", ".m2v", ".m2s", ".mp4", ".ogg", ".rm", ".wmv", ".mp4", ".qt", ".ogm", ".vob", ".webm", ".787", ".ogv"];

	this._internalVariables.imageFileTypes = [".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".gif"];

	this._internalVariables.isFileType = function (file, curFileTypes) {

		var fileExtension = file.substr(file.lastIndexOf("."), 5);
		fileExtension = fileExtension.toLowerCase();
	    var result = (noJquery.inArray(fileExtension.toLowerCase(), curFileTypes) != -1);
		return result;

	}

	this._internalVariables.isImg = function (file) {

		var instance = this.instance;
		return instance._internalVariables.isFileType (file, instance._internalVariables.imageFileTypes);

	}

	this._internalVariables.isVideo = function (file) {

		var instance = this.instance;
		return instance._internalVariables.isFileType (file, instance._internalVariables.videoFileTypes);

	}

	this._internalVariables.isDropFilesEnabled = function () {

		var instance = this.instance;
		var ua = navigator.userAgent;
		if (!instance.enableDropFiles) {
			return false;
		}
		if (!(ua.indexOf("MSIE") == -1 || ua.indexOf("MSIE 10.0") != -1)) { // Drag files works only on IE10+
			return false;
		}
		var ieVersion = instance._internalVariables.getIEVersion();
		if ((/Edge/.test(navigator.userAgent) || (ieVersion >= 0))
			&& instance._internalVariables.getUploadType() == "iframe") { // On Edge and IE, when using iframe, dropping is not an option (can't define input.files dynamically)
			return false;
		}
		if (instance._internalVariables.isMobileOrTablet()) {
			return false;
		}
		return true;

	}

	this._internalVariables.getIframeGatewayFullUrl = function () {
		
		var instance = this.instance;
		var iframeGatewayFullUrl = "";
		if (instance.iframeGateway.indexOf("//") == 0 || instance.iframeGateway.indexOf("http://") == 0 || instance.iframeGateway.indexOf("https://") == 0) {
			iframeGatewayFullUrl = instance.iframeGateway;
		} else {
			iframeGatewayFullUrl = window.location.href.substr(0, window.location.href.lastIndexOf("/"))+"/"+instance.iframeGateway;
		}
		return iframeGatewayFullUrl;

	}

	this._internalVariables.validateIframeGatewayPath = function () {

		var instance = this.instance;
		var iframeGatewayFullUrl = instance._internalVariables.getIframeGatewayFullUrl();
		if (instance._internalVariables.isCrossDomainScript(iframeGatewayFullUrl)) {

			instance._internalVariables.consoleError("Iframe gateway must be at same domain as current page, not at "+iframeGatewayFullUrl);

		} else {

			noJquery.ajax({
				type: "HEAD",
				url: iframeGatewayFullUrl,
				success: function(data) {
				},
				error: function(jqXHR, exception) {
					instance._internalVariables.consoleError("Iframe gateway can't be found at "+iframeGatewayFullUrl);
				}
			});

		}

	};

	this._internalVariables.getOrientation = function (readerResult, callback) {

		view = new DataView(readerResult);
        if (view.getUint16(0, false) != 0xFFD8)
        {
            return callback(-2);
        }
        var length = view.byteLength, offset = 2;
        while (offset < length) 
        {
            if (view.getUint16(offset+2, false) <= 8) return callback(-1);
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) 
            {
                if (view.getUint32(offset += 2, false) != 0x45786966) 
                {
                    return callback(-1);
                }

                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                {
                    if (view.getUint16(offset + (i * 12), little) == 0x0112)
                    {
                        return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                }
            }
            else if ((marker & 0xFF00) != 0xFF00)
            {
                break;
            }
            else
            { 
                offset += view.getUint16(offset, false);
            }
        }
        return callback(-1);

	}

	//
	//
	//	Init
	//
	//

	this._internalVariables.build();

}


var uploaerIframeGateway = {

	objs: [],

	uploaderIframeActionCompleted: function (iframeIndex, params) {

	    var curObj = this.objs[iframeIndex];
	    if (!curObj.uploaderIframeActionCompletedCalled) {
	        curObj.uploaderIframeActionCompletedCalled = true;
	        if (curObj.actionCompletedFunc != null) {
	            curObj.actionCompletedFunc(params);
	        }
	    	noJquery("iframe[data-request='"+iframeIndex+"']").remove();
	    }
	},
	
	uploadViaIframeGateway: function (formElementId, scriptUrl, iframeGatewayUrl, onCompleted) {
		
		var requestId = Math.floor(Math.random()*999999999);
		var iframeObj = new Object();
	    iframeObj.closed = false;
	    iframeObj.actionCompletedFunc = onCompleted;
	    uploaerIframeGateway.objs[requestId] = iframeObj;
	    
	    var iframeId = "uploader_gateway_iframe_"+formElementId;
	    if (noJquery("#"+iframeId).get(0) == null) {
	    	var iframeElement = "<iframe id='"+iframeId+"' data-request='"+requestId+"' name='"+iframeId+"' style='width: 1px; height: 1px; opacity: 0; display: none;'>";
	    	noJquery(iframeElement).appendTo('body');
	    	
	    }
	    
	    var formAction = scriptUrl;
	    if (formAction.indexOf("?") != -1) {
	    	formAction += "&";
	    } else {
	    	formAction += "?";
	    }
		formAction = formAction.split("{{request_id}}").join(requestId).split("{{iframe_gateway}}").join(iframeGatewayUrl);
		formAction += "_="+Math.random();
	    if (formAction.indexOf("//") == 0) {
	    	formAction = window.location.protocol+formAction;
	    }

		noJquery('#'+formElementId)
		.attr('action', formAction)
		.attr('target', iframeId)
		.attr('enctype', "multipart/form-data")
		.attr('method', "post")
	    .get(0).submit();

	},

	cancelUpload: function (formElementId, scriptUrl) {
		
	    var iframeId = "uploader_gateway_iframe_"+formElementId;
	    var formAction = scriptUrl;
	    if (noJquery("#"+iframeId).get(0) == null) {
	    	var iframeElement = "<iframe id='"+iframeId+"' name='"+iframeId+"' style='width: 1px; height: 1px; opacity: 0; display: none;'>";
	    	noJquery(iframeElement).appendTo('body');
	    }
		noJquery('#'+formElementId)
		.attr('action', formAction)
		.attr('target', iframeId)
		.attr('enctype', "multipart/form-data")
		.attr('method', "get")
		.get(0).submit();
	    
	}
	

}

//
//
//		noJquery
//
//

function noJquery (selector) {

	//
	//
	// Get elements
	if (!(this instanceof noJquery)) {
	    return new noJquery(selector);
	}
	if (typeof selector === 'function') {
		return selector.call(document);
	}
	this.length = 0;
	this.nodes = [];

	/*if (
		(typeof HTMLElement === "object" && selector instanceof HTMLElement)
		||
		(typeof NodeList != "undefined" && selector instanceof NodeList)
		) {*/
	if (
		typeof HTMLElement === "object" ? selector instanceof HTMLElement : //DOM2
		selector && typeof selector === "object" && selector !== null && selector.nodeType === 1 && typeof selector.nodeName === "string"
		) {
		//[].slice.call(selector);
	    this.nodes = selector.length > 1 ? [].slice.call(selector) : [selector];

	} else if (typeof selector === 'string') {

	    if (selector.indexOf("<") == 0/* && selector.indexOf(">") == selector.length - 1*/) {
	        var div = document.createElement('div');
			div.innerHTML = selector;
			this.nodes = [div.firstChild];
	    } else {
	        //this.nodes = [].slice.call(document.querySelectorAll(selector));
	        this.nodes = [];
	        var nodeslist = document.querySelectorAll(selector);
	        for (var i=0; i<nodeslist.length; i++) {
	        	this.nodes.push(nodeslist.item(i));
	        }
	    }
	}

	if (this.nodes.length) {
	    this.length = this.nodes.length;
	    for (var i = 0; i < this.nodes.length; i++) {
	        this[i] = this.nodes[i];
	    }
	}

}
noJquery.fn = noJquery.prototype;

//
//
// Define functions for elements

noJquery.fn.each = function(callback) {
    for (var i = 0; i < this.length; i++) {
        callback.call(this[i], this, i);
    }
    return this;
};

noJquery.fn.hasClass = function(className) {
	var hasClass = false;
	for (var i=0; i<this.nodes.length; i++) {
		if (this.nodes[i].classList) {
			if (this.nodes[i].classList.contains(className)) {
				hasClass = true;
			}
		} else {
			if (new RegExp('(^| )' + className + '( |$)', 'gi').test(this.nodes[i].className)) {
				hasClass = true;
			}
		}
	}
	return hasClass;
};

noJquery.fn.addClass = function(classes) {
	if (!this.hasClass(classes)) {
		for (var i=0; i<this.nodes.length; i++) {
			this.nodes[i].className = this.nodes[i].className.trim() + ' ' + classes;
		}
	}
	return this;
};

noJquery.fn.removeClass = function(className) {
    this.each(function() {
        this.className = this.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
    });
	return this;
};

noJquery.fn.text = function(str) {
	if (typeof str == "undefined") {
		str = "";
	}
    return this.each(function() {
        this.innerText = str;
    });
    return this;
};

noJquery.fn.html = function(str) {
	if (str == null || typeof str == "undefined") {
		if (this.nodes != null && this.nodes.length > 0) {
			return this.nodes[0].innerHTML;
		}
		return null;
	}
	for (var i=0; i<this.nodes.length; i++) {
		this.nodes[i].innerHTML = str;
	}
    return this;
};

noJquery.fn.css = function(styleAttr, val) {
    if (typeof styleAttr != "undefined") {
		for (var i=0; i<this.nodes.length; i++) {

			if (
				(styleAttr == "width"
        		|| styleAttr == "height"
        		|| styleAttr == "left"
        		|| styleAttr == "top")
				&& !isNaN(val)
				&& val != null && val != "") {
				val += "px";
			}

        	if (styleAttr.indexOf("-") != -1) {
        		var words = styleAttr.split("-");
        		if (words.length > 1) {
        			words[1] = words[1].charAt(0).toUpperCase() + words[1].slice(1);
        		}
        		this.nodes[i].style[words.join("")] = val;
        	} else {
        		this.nodes[i].style[styleAttr] = val;
        	}

		}
    }
    return this;
};

noJquery.events = [];

noJquery.fn.on = function(name, handler) {
	name = name.split(" ").join("");
	var names = name.split(",");
	for (var i=0; i<names.length; i++) {
	    this.each(function() {
	    	var eventObj = {elem: this, name: name};
	    	eventObj.handler = function (event) {
	        	event.originalEvent = event;

	        	// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && event.clientX != null ) {

					if (navigator.appVersion.indexOf("MSIE") != -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) == 8) {
						event.pageX = event.clientX;
						event.pageY = event.clientY;
					} else {
						eventDoc = event.target.ownerDocument || document;
						doc = eventDoc.documentElement;
						body = eventDoc.body;
						event.pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
						event.pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
					}
				}

	        	//handler (event);
	        	handler.call(this, event);
	        };
	        this.addEventListener(names[i],eventObj.handler , false);
	        noJquery.events.push (eventObj);
	    });
	}
    return this;
};

noJquery.fn.unbind = function(name) {
	name = name.split(" ").join("");
	var names = name.split(",");
	for (var i=0; i<names.length; i++) {
	    this.each(function() {
	    	for (var j=0; j<noJquery.events.length; j++) {
	    		if (noJquery.events[j].elem == this && noJquery.events[j].name == name) {
			        this.removeEventListener(names[i], noJquery.events[j].handler, false);
	    		}
	    	}
	    });
	}
    return this;
};

noJquery.fn.appendTo = function (appentToSelector) {
	if (this.nodes != null && this.nodes.length > 0) {
		document.querySelector(appentToSelector).appendChild(this.nodes[0]);
	}
	return this;
};

noJquery.fn.append = function (element) {
	for (var i=0; i<this.nodes.length; i++) {
		this.nodes[i].appendChild(element);
	}
	return this;
};

noJquery.fn.find = function (selector) {
	if (this.nodes != null && this.nodes.length > 0) {
		return new noJquery(this.nodes[0].querySelector(selector));
	}
	return this;
};

noJquery.fn.attr = function (attrName, attrValue) {
	if (typeof attrValue == "undefined") {
		if (this.nodes != null && this.nodes.length > 0) {
			return this.nodes[0].getAttribute(attrName);
		}
		return null;
	} else {
		for (var i=0; i<this.nodes.length; i++) {
			this.nodes[i].setAttribute(attrName, attrValue);
		}
		return this;
	}
};

noJquery.fn.removeAttr = function (attrName) {
	for (var i=0; i<this.nodes.length; i++) {
		this.nodes[i].removeAttribute(attrName);
	}
	return this;
};

noJquery.fn.get = function (index) {
	if (this.nodes == null || this.nodes.length == 0) {
		return null;
	}
	return this.nodes[index];
};

noJquery.fn.remove = function () {
	if (this.nodes != null && this.nodes.length > 0) {
		this.nodes[0].parentNode.removeChild(this.nodes[0]);
	}
	return this;
};

noJquery.fn.parent = function () {
	if (this.nodes != null && this.nodes.length > 0) {
		this.nodes = [this.nodes[0].parentNode];
	}
	return this;
};

noJquery.fn.outerWidth = function () {
	if (this.nodes != null && this.nodes.length > 0) {
		return this.nodes[0].offsetWidth;
	}
	return null;
};

noJquery.fn.outerHeight = function () {
	if (this.nodes != null && this.nodes.length > 0) {
		return this.nodes[0].outerHeight;
	}
	return null;
};

noJquery.fn.offset = function () {
	if (this.nodes != null && this.nodes.length > 0) {
		var rect = this.nodes[0].getBoundingClientRect();
		var scrollTop = window.pageYOffset || document.body.scrollTop;
    	var scrollLeft = window.pageXOffset || document.body.scrollLeft;
		return {
			top: rect.top + scrollTop,
			left: rect.left + scrollLeft
		}
	}
	return null;
};

// Elements animation

noJquery.animations = [];
noJquery.getAnimationByElementAndType = function (element, animationType) {
	for (var i=0; i<noJquery.animations.length; i++) {
		if (noJquery.animations[i].element == element &&
			noJquery.animations[i].animationType == animationType
			) {
			return noJquery.animations[i];
		}
	}
	curAnimation = {element: element, animationType: animationType, animationFrame: null, timeout: null};
	noJquery.animations.push(curAnimation);
	return curAnimation;
}

noJquery.fn.fadeIn = function (onFinished) {
	this.animate({opacity: 1}, 400, onFinished);
};

noJquery.fn.fadeOut = function (onFinished) {
	this.animate({opacity: 0}, 400, onFinished);
};

noJquery.fn.animate = function (params, duration, onFinished) {

	for (var i=0; i<this.nodes.length; i++) {

		var curElement = this.nodes[i];
		var opacity = 0;
		var opacityDir = 0;

		for (var param in params) {
			if (param == "opacity") {
				if (typeof window.getComputedStyle != "undefined") {
					opacity = parseInt(window.getComputedStyle(curElement).getPropertyValue("opacity"));
					if (opacity < params[param]) {
						opacityDir = 1;
					} else {
						opacityDir = -1;
					}
				}
			}
			var curAnimation = noJquery.getAnimationByElementAndType(curElement, param);
			if (curAnimation != null) {
				if (curAnimation.animationFrame != null) {
					window.cancelAnimationFrame(curAnimation.animationFrame);
				}
				if (curAnimation.timeout != null) {
					clearTimeout(curAnimation.timeout);
					curAnimation.timeout = null;
				}
			}
		}

		var finishTime = new Date();
		finishTime.setMilliseconds(finishTime.getMilliseconds() + duration);
		var tick = function() {

			for (var param in params) {

				var curAnimation = noJquery.getAnimationByElementAndType(curElement, param);
				
				if (param == "opacity") {
					var curOpacity = opacity + (params[param] - opacity) * (1-((finishTime-new Date()) / duration));

					curElement.style.opacity = curOpacity;
					curElement.style.filter = 'alpha(opacity=' + (curOpacity * 100)|0 + ')';

					if (
						(opacityDir > 0 && curOpacity < params[param])
						||
						(opacityDir <= 0 && curOpacity > params[param])
						) {
						if (window.requestAnimationFrame) {
							curAnimation.animationFrame = requestAnimationFrame(tick);
						} else {
							curAnimation.timeout = setTimeout(tick, 16);
						}
					} else {
						curElement.style.opacity = params[param];
						curElement.style.filter = 'alpha(opacity=' + (params[param] * 100)|0 + ')';
						if (typeof onFinished == "function") {
							onFinished();
						}
					}
				}

			}

		};

		tick();

	}

}

// General Utils
noJquery.inArray = function (item, array) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === item) {
			return i;
		}
	}
	return -1;
}

noJquery.extend = function(out) {
	out = out || {};

	for (var i = 1; i < arguments.length; i++) {
		if (!arguments[i]) {
			continue;
		}

		for (var key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key)) {
				out[key] = arguments[i][key];
			}
		}
	}

	return out;
};

noJquery.ajax = function (params) {

	if (params.dataType == 'jsonp') {
		return noJquery.jsonp (params);
	} else if (params.type == "HEAD") {

		var jsonpRequest = {};
		var xhr = new XMLHttpRequest();
		xhr.open(params.type, params.url);
		xhr.onreadystatechange = function (oEvent) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					if (typeof params.success == "function") {
						params.success(this.response);
					}
		        } else if (xhr.status === 0) {
					if (typeof params.error == "function") {
						params.error(xhr, "abort");
					}
				} else {
					if (typeof params.error == "function") {
						params.error(xhr, "error");
					}
				}  
			}
		};
		xhr.send();
		jsonpRequest.xhr = jsonpRequest;
		return jsonpRequest;
	}
	return null;

}

noJquery.jsonp = function (params) {

	var jsonpRequest = {};
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    var script = document.createElement('script');
    script.src = params.url + (params.url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    window[callbackName] = function(data) {
        window[callbackName] = function () {};
        document.body.removeChild(script);
        script = null;
        if (typeof params.success) {
        	params.success(data);
        }
    };
    if (typeof params.error) {
    	script.addEventListener('error', params.error);
    }
    
    document.body.appendChild(script);
    jsonpRequest.abort = function () {
    	//delete window[callbackName];
    	window[callbackName] = function () {};
    	try {
        	document.body.removeChild(script);
    	} catch (e) {
    	}
        script = null;
        if (typeof params.error) {
	    	params.error (null, "abort");
	    }
    }
    return jsonpRequest;

}

window.noJquery = noJquery;


// IE8 polyfill for trim
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

// IE8 polyfill for Array.isArray
if(typeof Array.isArray !== 'function') {
	Array.isArray = function (obj) {
		return Object.prototype.toString.call(obj) === "[object Array]";
	};
}


// IE8 polyfill for Object.defineProperty (works partially - only "get" and "set", without triggering functions)
if (!Object.defineProperty ||
      !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
	Object.defineProperty = function defineProperty(object, property, descriptor) {
        /*descriptor._internalVariables = {
        	setVariable: function () {
        	}
        };*/
        if ('get' in descriptor) {
        	if (typeof (descriptor.get) == "function") {
        		var returnValue = descriptor.get();
        		return returnValue;
        	}
        }
        if ('set' in descriptor) {
        	if (typeof (descriptor.set) == "function") {
        		descriptor.set();
        	}
        }
	};
}

// IE8 polyfill for addEventListener

!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
	WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
		var target = this;

		registry.unshift([target, type, listener, function (event) {
			event.currentTarget = target;
			event.preventDefault = function () { event.returnValue = false };
			event.stopPropagation = function () { event.cancelBubble = true };
			event.target = event.srcElement || target;

			listener.call(target, event);
		}]);

		this.attachEvent("on" + type, registry[0][3]);
	};

	WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
		for (var index = 0, register; register = registry[index]; ++index) {
			if (register[0] == this && register[1] == type && register[2] == listener) {
				return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
			}
		}
	};

	WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
		return this.fireEvent("on" + eventObject.type, eventObject);
	};
})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
