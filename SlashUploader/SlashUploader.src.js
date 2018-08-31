/*
 * SlashUploader - JS plugin - Version 1.5.0
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
			$(instance.elements.uploaderInputElement).attr("accept", instance.acceptOnlyFilesTypes);
		} else if (variableName == "maxFiles") {

			if (instance.maxFiles > 1) {
				if (instance.elements.uploaderInputElement != null) {
					$(instance.elements.uploaderInputElement).attr("multiple", "multiple");
				}
			} else {
				if (instance.elements.uploaderInputElement != null) {
					$(instance.elements.uploaderInputElement).removeAttr('multiple');
				}
			}

		} else if (variableName == "showUploadedFiles") {
			if (instance.showUploadedFiles) {
				$(instance.elements.uploaderResultWrapperElement).attr("style", "");
				$(instance.elements.uploaderDropAreaWrapper).attr("style", "");
			} else {
				$(instance.elements.uploaderResultWrapperElement).attr("style", "width: 0px; display: none;");
				$(instance.elements.uploaderDropAreaWrapper).attr("style", "width: 100%;");
			}
		} else if (variableName == "disabled") {
			if (instance.disabled) {
				$(instance.elements.containerElement).addClass("disabled");
				$(instance.elements.uploaderDropAreaElement).find(".input_wrapper").css("display", "none");
			} else {
				$(instance.elements.containerElement).removeClass("disabled");
				$(instance.elements.uploaderDropAreaElement).find(".input_wrapper").css("display", "");
			}
		} else if (variableName == "rtl") {
			if (instance.rtl) {
				$("#"+instance.elements.elementId).addClass("rtl");
			} else {
				$("#"+instance.elements.elementId).removeClass("rtl");
			}
		} else if (variableName == "enableDropFiles") {
			instance._internalVariables.setDropFileEvents();
		} else if (variableName == "progressAnimationType") {
			instance._internalVariables.setProgressDisplay();
		} else if (variableName == "maxFileChars" || variableName == "uploadedFiles") {
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
	        this._internalVariables.setVariable();
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
	
	this.serverScripts = {
		uploadChunk: "./SlashUploader/server/UploadFiles.aspx?method=upload_chunk&file_name={{file_name}}&chunk_index={{chunk_index}}&request_id={{request_id}}",
		combineChunks: "./SlashUploader/server/UploadFiles.aspx?method=combine_chunks&rotation={{rotation}}&file_name={{file_name}}&request_id={{request_id}}",
		uploadStream: "./SlashUploader/server/UploadFiles.aspx?method=upload_stream&rotation={{rotation}}&file_name={{file_name}}",
		uploadThroughIframe: "./SlashUploader/server/UploadFiles.aspx?method=upload_through_iframe&rotation={{rotation}}&request_id={{request_id}}&iframe_gateway={{iframe_gateway}}",
		fileNameVariableName: "file_name",
		fileUrlVariableName: "file_path",
		errorVariableName: "error"
	};

	this.displayErrorDuration = 4500;

	_variables.showUploadedFiles = true;
	_variables.disabled = false;
	_variables.enableDropFiles = true;
	_variables.maxFiles = 9999;
	_variables.progressAnimationType = "inline";
	_variables.maxFileChars = 22;
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
	this.errors.unspecifiedError = "Unspecified error";



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
			$.extend(instance.errors, instance.opts.errors);
			delete instance.opts.errors;
			$.extend(instance.serverScripts, instance.opts.serverScripts);
			delete instance.opts.serverScripts;
			$.extend(instance, instance.opts);
		}

		if (instance.elements.containerElement.get(0) != null) {

			var curElementToTest = instance.elements.containerElement;
			var curElementToTestTag = curElementToTest.prop("tagName").toUpperCase();
			var containedInForm = false;
			while (curElementToTestTag != "BODY" && !containedInForm) {
				curElementToTest = curElementToTest.parent();
				curElementToTestTag = curElementToTest.prop("tagName").toUpperCase();
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
				    //if (instance.progressAnimationType.indexOf("bar") != -1) {
			    	html += '<div class="uploader_progress_container" style="display: none;">';
			    	html += '	<table><tr>';
			    	html += '		<td class="uploader_progress_bar_loading"><div class="uploader_spinner"></div><span></span></td>';
			    	html += '		<td class="uploader_progress_bar_loading_padding"></td>';
			    	html += '		<td class="uploader_progress_bar"><div><div></div></div></td>';
			    	html += '		<td class="uploader_progress_bar_padding"></td>';
			    	html += '		<td class="uploader_progress_bar_text"></td>';
			    	html += '	</tr></table>';
			    	html += '</div>';
				    //}
			    } else {
			    	html += '<div class="uploader_drop_area_custom">';
			    	html += '</div>';
			    }
			    html += '</form>';

				if (!instance.customHTML) {
					instance.elements.containerElement.html (html);
				} else {
					instance.elements.containerElement.css("position", "relative");
					instance.elements.containerElement.html (html+instance.elements.containerElement.html());
				}
				instance.elements.containerElement.addClass("slash_uploader");

				if (instance.customHTML || (IEVersion >= 0 && IEVersion <= 8)) {
					$(instance.elements.containerElement).mousemove(function( event ) {
						var element = $(this);
						if ($(this).find(".uploader_drop_area_wrapper").get(0) != null) {
							element = $(this).find(".uploader_drop_area_wrapper");
						}
						instance.elements.uploaderDropAreaElement.find("input").css({
												            left: event.pageX-element.offset().left-120,
												            top: event.pageY-element.offset().top-20
												        });
					});
				}
				
			    if (!instance.customHTML) {
					instance.elements.uploaderDropAreaElement = $(instance.elements.containerElement).find(".uploader_drop_area");
				} else {
					instance.elements.uploaderDropAreaElement = $(instance.elements.containerElement).find(".uploader_drop_area_custom");
				}
				instance.elements.uploaderTextElement = $(instance.elements.containerElement).find(".uploader_drop_area").find(".uploader_text span");
				instance.elements.uploaderDropAreaWrapper = $(instance.elements.containerElement).find(".uploader_drop_area_wrapper");
				instance.elements.uploaderDropAreaBottomLayerElement = $(instance.elements.containerElement).find(".uploader_drop_area_bottom");
				instance.elements.uploaderDropAreaMiddleLayerElement = $(instance.elements.containerElement).find(".uploader_drop_area_middle");
				instance.elements.uploaderResultElement = $(instance.elements.containerElement).find(".uploader_result");
				instance.elements.uploaderResultWrapperElement = $(instance.elements.containerElement).find(".uploader_result_wrapper");
				instance.elements.uploaderProgressContainerElement = $(instance.elements.containerElement).find(".uploader_progress_container");
				instance.elements.uploaderProgressBarElement = $(instance.elements.containerElement).find(".uploader_progress_bar");
				instance.elements.uploaderProgressBarPaddingElement = $(instance.elements.containerElement).find(".uploader_progress_bar_padding");
				instance.elements.uploaderProgressBarTextElement = $(instance.elements.containerElement).find(".uploader_progress_bar_text");
				instance.elements.uploaderProgressBarColorElement = $(instance.elements.containerElement).find(".uploader_progress_container .uploader_progress_bar div div");
				instance.elements.uploaderCancelButton = $(instance.elements.containerElement).find(".uploader_cancel");
				

				instance._internalVariables.buildFileInput ();
				instance._internalVariables.setProgressDisplay();
				instance._internalVariables.setText();
				instance._internalVariables.setDocumentEvents();
				instance._internalVariables.setDropFileEvents();
				instance._internalVariables.showCurrentFiles();
				instance.elements.uploaderCancelButton.on("click", function () {
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

	this._internalVariables.setProgressDisplay = function () {

		var instance = this.instance;
		if (instance.elements.containerElement != null) {
			if (instance.progressAnimationType == null) {
				instance.progressAnimationType = "";
			}
		    if (instance.progressAnimationType.indexOf("bar") != -1) {
		        $(instance.elements.containerElement).addClass("loading_bar");
		        if (instance._internalVariables.isUploading && instance.elements.uploaderProgressContainerElement != null) {
		        	instance.elements.uploaderProgressContainerElement.css("display", "");
		        }
		    } else {
		    	$(instance.elements.containerElement).removeClass("loading_bar");
		        if (instance.elements.uploaderProgressContainerElement != null) {
			    	instance.elements.uploaderProgressContainerElement.css("display", "none");
			    }
		    }

		    if (instance.elements.uploaderDropAreaBottomLayerElement != null) {
				if (instance.progressAnimationType.indexOf("inline") != -1 && instance._internalVariables.isUploading
					&& (instance._internalVariables.getUploadType() == "chunks" || instance._internalVariables.getUploadType() == "stream")) {
					instance.elements.uploaderDropAreaBottomLayerElement.css("display", "");
					instance.elements.uploaderDropAreaMiddleLayerElement.css("display", "");
				} else {
					instance.elements.uploaderDropAreaBottomLayerElement.css("display", "none");
					instance.elements.uploaderDropAreaMiddleLayerElement.css("display", "none");
				}
		    }

		}

	}

	this._internalVariables.validateFiles = function () {

		var instance = this.instance;
		var errors = [];
    	for (var i=0; i<instance._internalVariables.curUploadingFilesData.length; i++) {
    		var fileData = instance._internalVariables.curUploadingFilesData[i];
    		var fileName = fileData.name;
    		var fileExtension = fileData.extension;
    		var fileSize = fileData.size/1024;
    		
    		if(instance.allowedFilesExtensions != null && instance.allowedFilesExtensions.length > 0 && $.inArray(fileExtension.toLowerCase(), instance.allowedFilesExtensions) == -1){
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
		instance.elements.uploaderDropAreaElement.find(".input_wrapper").remove();
		instance.elements.uploaderDropAreaElement.append( $("<div class='input_wrapper'><input name='"+instance.elements.elementId+"_input' type='file' "+((instance.maxFiles > 1) ? "multiple" : "")+" /></div>") );

	    var filesUpload = $(instance.elements.containerElement).find("input").get(0);
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

				instance.elements.uploaderDropAreaElement.find("input").css("display", "none");
	        	
	            if (!instance._internalVariables.isUploading) {

	                if (curFiles) {
	                    //instance._internalVariables.curUploadingFiles = curFiles;
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
	    instance.elements.uploaderInputElement = $(instance.elements.containerElement).find("input");
	    instance._internalVariables.setVariable("acceptOnlyFilesTypes");
	    instance._internalVariables.setVariable("showUploadedFiles");
	    instance._internalVariables.setVariable("disabled");
	    instance._internalVariables.setVariable("rtl");
	    instance._internalVariables.checkDragFileStates ();
	}

	this._internalVariables.showUploadBtn = function () {
		var instance = this.instance;
		instance.elements.uploaderDropAreaBottomLayerElement.css("display", "none");
		instance.elements.uploaderDropAreaMiddleLayerElement.css("display", "none");
		instance.elements.uploaderDropAreaElement.removeClass("uploading");
        $(instance.elements.containerElement).find("input").attr("onclick", "");
        instance._internalVariables.setText();
		instance._internalVariables.buildFileInput ();
		instance.elements.uploaderProgressContainerElement.css("display", "none");
		instance.elements.uploaderProgressBarColorElement.css("width", "0%");
		instance.elements.uploaderCancelButton.css("display", "none");
	}

	//
	//
	//	Events Handler
	//
	//

	this._internalVariables.setDropFileEvents = function () {

		var instance = this.instance;
		if (instance.elements.uploaderDropAreaElement != null) {

			instance.elements.uploaderDropAreaElement.unbind("dragleave");
			instance.elements.uploaderDropAreaElement.unbind ("dragenter, dragover");
			instance.elements.uploaderDropAreaElement.unbind ("drop");

			if (instance._internalVariables.isDropFilesEnabled()) {
				instance.elements.uploaderDropAreaElement.bind("dragleave", function (evt) {
					if (!instance.disabled) {
						instance._internalVariables.draggedOnBtn = false;
						instance._internalVariables.checkDragFileStates ();
						evt.preventDefault();
						evt.stopPropagation();
					}
				});
				
				instance.elements.uploaderDropAreaElement.bind ("dragenter, dragover", function (evt) {
					if (!instance.disabled && !instance._internalVariables.isUploading) {
						if (evt.originalEvent.dataTransfer.types[0] == "Files" || evt.originalEvent.dataTransfer.types[0] == "text/uri-list" || evt.originalEvent.dataTransfer.types[0] == "application/x-moz-file") {
							instance._internalVariables.draggedOnBtn = true;
							instance._internalVariables.checkDragFileStates ()
							evt.preventDefault();
							evt.stopPropagation();
						}
					}
				});
				
				instance.elements.uploaderDropAreaElement.bind ("drop", function (evt) {
					if (!instance.disabled && !instance._internalVariables.isUploading) {
						instance._internalVariables.draggedOnBtn = false;
						instance._internalVariables.draggedOnDocument = false;
						instance._internalVariables.checkDragFileStates ();
						var curFiles = evt.originalEvent.dataTransfer.files;
			            //instance._internalVariables.curUploadingFiles = curFiles;

			            instance._internalVariables.curUploadingFilesData = [];
	                    for (var i=0; i<curFiles.length; i++) {
	                    	var curFile = curFiles[i];
	                    	instance._internalVariables.curUploadingFilesData.push (new FileData(curFile));
	                    }

			            instance._internalVariables.totalFilesToUpload = Math.min(curFiles.length, instance.maxFiles);
			            instance.elements.uploaderDropAreaElement.find("input").css("display", "none");

			            if (instance._internalVariables.getUploadType() == "iframe") {

				        	instance.elements.uploaderDropAreaElement.find("input").prop("files", evt.originalEvent.dataTransfer.files);
				        	// Triggers "onchange"
				        	if (!instance._internalVariables.onChangeTriggered) { // Firefox don't trigger onchange when setting the input value
				        		setTimeout(function () {
				        			instance.elements.uploaderDropAreaElement.find("input").change();
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
				if (!instance.disabled && !instance._internalVariables.isUploading && instance._internalVariables.isDropFilesEnabled()) {
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
			
			$("body").mouseleave(function(){
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
				
				instance.elements.uploaderDropAreaElement.removeClass("dragged_enter");
				instance.elements.uploaderDropAreaElement.removeClass("dragged_over");
				instance.elements.uploaderDropAreaElement.removeClass("hover");
				instance.elements.uploaderDropAreaElement.removeClass("uploading");

				if (instance._internalVariables.draggedOnBtn) {
					instance.elements.uploaderDropAreaElement.addClass("dragged_over");
				} else if (instance._internalVariables.draggedOnDocument) {
					instance.elements.uploaderDropAreaElement.addClass("dragged_enter");
				} else if (instance._internalVariables.hoverOnBtn) {
					instance.elements.uploaderDropAreaElement.addClass("hover");
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

			if (!instance.disabled && !instance._internalVariables.isUploading) {
				
				if (instance._internalVariables.draggedOnBtn) {
					instance.elements.uploaderTextElement.find('span').html(instance.dropFilesText);
				} else if (instance._internalVariables.draggedOnDocument) {
					instance.elements.uploaderTextElement.find('span').html(instance.dropFilesText);
				} else if (instance._internalVariables.hoverOnBtn) {
					instance.elements.uploaderTextElement.find('span').html(instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled);
				} else {
					instance.elements.uploaderTextElement.find('span').html(instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled);
				}
				instance.elements.uploaderTextElement.find('.uploader_spinner').css("display", "none");

			} else if (instance._internalVariables.isUploading) {
        		instance.elements.uploaderTextElement.find('span').html(instance._internalVariables.getUploadingText());
        		instance.elements.uploaderTextElement.find('.uploader_spinner').css("display", "");
			} else {
				instance.elements.uploaderTextElement.find('span').html(instance._internalVariables.isDropFilesEnabled() ? instance.browseText : instance.browseTextDropDisabled);
        		instance.elements.uploaderTextElement.find('.uploader_spinner').css("display", "none");
			}
			instance.elements.uploaderCancelButton.find('span').html(instance.cancelText);
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
	/*
    this._internalVariables.traverseFiles = function () {

		var instance = this.instance;
		if (typeof instance._internalVariables.curUploadingFiles !== "undefined" && instance._internalVariables.curUploadingFiles.length > 0) {
			var errors = instance._internalVariables.validateFiles(instance._internalVariables.curUploadingFiles);
			if (errors.length == 0) {
				if (typeof (instance.onFilesSelected) == "function") {
	        		instance.onFilesSelected (instance._internalVariables.curUploadingFiles);
	        	}
            	instance._internalVariables.curUploadingFilesData = [];
            	if (instance.resetFilesOnEachUpload) {
                	instance.uploadedFiles = [];
            	}
                instance._internalVariables.curUploadingFileIndex = 0;
                setTimeout(function () { // Using timeout because geting exif might be heavy
					instance._internalVariables.getFileMetadata ();
                }, 2);
			} else {
	    		instance._internalVariables.parseErrors(errors);
	    	}

		}

	}
	*/

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
			  		reader.onload = function (event) {
			  			var exifObject = getExifData(event.target.result);
			  			var imageRotation = 0;
						if(exifObject) {
							if (exifObject.Orientation) {
								if (exifObject.Orientation == 6) {
									imageRotation = 90;
								} else if (exifObject.Orientation == 3) {
									imageRotation = 180;
								} else if (exifObject.Orientation == 8) {
									imageRotation = 270;
								}
							}
						}

			  			var image = new Image();
					    image.src = event.target.result;
					    image.onload = function() {
					        metadata.rotation = imageRotation;
					        metadata.width = this.width;
					        metadata.height = this.height;
			  				instance._internalVariables.getFileMetaFinished (file, metadata);
					    };

			  		}
			  		reader.readAsDataURL(file);
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
		curFileData.duration = fileMetadata.duration;
		curFileData.width = fileMetadata.width;
		curFileData.height = fileMetadata.height;
		curFileData.rotation = fileMetadata.rotation;
		//instance._internalVariables.curUploadingFilesData.push(fileMetadata);
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

	/*
	this._internalVariables.getFileMetaFinished = function (file, fileMetadata) {
		var instance = this.instance;
		if (instance._internalVariables.getUploadType() == "chunks" || instance._internalVariables.getUploadType() == "stream") {
			instance._internalVariables.uploadFile ([file], fileMetadata);
		} else {
			
			instance._internalVariables.curUploadingFilesData.push(fileMetadata);
			var isLastFile = (instance._internalVariables.curUploadingFiles.length <= instance._internalVariables.curUploadingFileIndex+1) || (instance._internalVariables.curUploadingFileIndex+1 >= instance.maxFiles);
			if (isLastFile) {
				instance._internalVariables.uploadFile (instance._internalVariables.curUploadingFiles, fileMetadata);
			} else {
				instance._internalVariables.curUploadingFileIndex ++;
				instance._internalVariables.getFileMetadata();
			}
			
		}

	}
	*/
	this._internalVariables.uploadFile = function () {

		var instance = this.instance;

		instance.elements.uploaderDropAreaBottomLayerElement.find("img").attr("src", "");
		instance.elements.uploaderDropAreaMiddleLayerElement.find("img").attr("src", "");
		instance.elements.uploaderDropAreaBottomLayerElement.css({transition: 'width 0s', '-webkit-transition': 'width 0s', width: '0px'});
		setTimeout(function () {
			$(instance.elements.uploaderDropAreaBottomLayerElement).css({transition:'width .2s', '-webkit-transition': 'width .2s'});
		}, 10);

		if (instance.progressAnimationType.indexOf("bar") != -1) {
			instance.elements.uploaderProgressContainerElement.css("display", "");
		}
		if (instance._internalVariables.getUploadType() == "iframe") {
			instance.elements.uploaderProgressBarElement.find("div").css("display", "none");
			instance.elements.uploaderProgressBarTextElement.css("width", "auto");
			instance.elements.uploaderProgressBarPaddingElement.css("display", "none");
		} else {
			instance.elements.uploaderProgressBarElement.find("div").css("display", "");
			instance.elements.uploaderProgressBarTextElement.css("width", "1%");
			instance.elements.uploaderProgressBarPaddingElement.css("display", "");
		}
		instance.elements.uploaderResultElement.removeClass("error");
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
		instance.elements.uploaderProgressBarTextElement.html(text);
		
		instance._internalVariables.isUploading = true;
		instance.elements.uploaderCancelButton.css("display", "block");
		instance._internalVariables.setProgressDisplay();
	    $(instance.elements.containerElement).find("input").attr("onclick", "return false;");

	    instance._internalVariables.setText();
		instance.elements.uploaderDropAreaElement.removeClass("dragged_enter");
		instance.elements.uploaderDropAreaElement.removeClass("dragged_over");
		instance.elements.uploaderDropAreaElement.removeClass("hover");
		instance.elements.uploaderDropAreaElement.addClass("uploading");

		instance.elements.uploaderDropAreaBottomLayerElement.find("img").css("width", instance.elements.uploaderDropAreaElement.outerWidth());
		instance.elements.uploaderDropAreaMiddleLayerElement.find("img").css("width", instance.elements.uploaderDropAreaElement.outerWidth());
		var imgTempUrl = null;
		if (typeof(URL) != "undefined") {
			imgTempUrl = URL.createObjectURL(files[fileIndex].file);
		}

		if (imgTempUrl != null && imgTempUrl != "" && instance._internalVariables.isImg(files[fileIndex].name)) {
			instance.elements.uploaderDropAreaBottomLayerElement.find("img").attr("src", imgTempUrl).css("display", "");
			instance.elements.uploaderDropAreaMiddleLayerElement.find("img").attr("src", imgTempUrl).css("display", "");
			instance.elements.uploaderDropAreaBottomLayerElement.css("opacity", "0");
			instance.elements.uploaderDropAreaBottomLayerElement.find("img").unbind("load");
			instance.elements.uploaderDropAreaBottomLayerElement.find("img").bind("load", function() {
				$(this).parent().animate({opacity: 1}, 400);
			});
			instance.elements.uploaderDropAreaMiddleLayerElement.css("opacity", "0");
			instance.elements.uploaderDropAreaMiddleLayerElement.find("img").unbind("load");
			instance.elements.uploaderDropAreaMiddleLayerElement.find("img").bind("load", function() {
				$(this).parent().animate({opacity: 1}, 400);
			});
		} else {
			instance.elements.uploaderDropAreaBottomLayerElement.find("img").attr("src", "").css("display", "none");
			instance.elements.uploaderDropAreaMiddleLayerElement.find("img").attr("src", "").css("display", "none");
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
				        var jsonObj = jQuery.parseJSON(result);

				        function parseUploadResult () {
				        	instance._internalVariables.parseUploadResult (jsonObj, isLastFile, files[fileIndex].file);
				        	
				            if (!isLastFile && instance._internalVariables.curUploadingFilesData.length > 0) {
				                instance._internalVariables.uploadFile ();
				            }
				        }
				        
				        if (instance.elements.uploaderDropAreaBottomLayerElement.get(0) != null) {
						    instance.elements.uploaderDropAreaBottomLayerElement.animate({opacity: 0}, 200, function () {
						    	parseUploadResult();
						    });
				        } else {
				        	parseUploadResult();
				        }
					    instance.elements.uploaderDropAreaMiddleLayerElement.animate({opacity: 0}, 200);
					} catch (err) {
						instance._internalVariables.setError('upload_failed', files[fileIndex], result);
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
					window.location.href.substr(0, window.location.href.lastIndexOf("/"))+"/"+instance.iframeGateway,
					function (data) {
						instance._internalVariables.onFileProgress (1);
						if ($(instance.elements.uploaderDropAreaBottomLayerElement).get(0) == null) {
							instance._internalVariables.parseUploadResult (data, true, null);
						} else {
							instance.elements.uploaderDropAreaBottomLayerElement.animate({opacity: 0}, 200, function () {
								instance._internalVariables.parseUploadResult (data, true, null);
							});
						}
						instance.elements.uploaderDropAreaMiddleLayerElement.animate({opacity: 0}, 200, function () {
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

						var result = jQuery.parseJSON(this.response);
						for (var i=0; i<result.length; i++) {
							if (result[i][instance.serverScripts.errorVariableName] != null && result[i][instance.serverScripts.errorVariableName] != "") {
								instance._internalVariables.setError('upload_failed', file, result[i]);
								hasError = true;
								break;
							}
						}

					} catch (err) {
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
		instance._internalVariables.uploadFileChunkXhr = $.ajax({
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
			instance.elements.uploaderProgressBarColorElement.css("width", ((curBarProgress) + "%"));
		}
		if (instance.progressAnimationType.indexOf("inline") != -1) {
			instance.elements.uploaderDropAreaBottomLayerElement.css("width", Math.ceil(progress*100)+"%");
			instance.elements.uploaderDropAreaMiddleLayerElement.css("width", instance.elements.uploaderDropAreaElement.outerWidth());
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
	    	uploaerIframeGateway.cancelUpload (instance.elements.elementId, instance.iframeGateway);
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
		
		for (var i=0; i<result.length; i++) {
			if (result[i][instance.serverScripts.fileNameVariableName] == null || result[i][instance.serverScripts.fileNameVariableName] == "") {
				instance._internalVariables.setError('upload_failed', file, result[i]);
				hasError = true;
				break;
			} else {
				instance.uploadedFiles.push (result[i]);
			}
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
		    	instance.elements.uploaderResultElement.html("");
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
		    	instance.elements.uploaderResultElement.html(filesListHtml);
		    	
		    }

	        $(instance.elements.containerElement).find(".uploader_delete_btn").click(function () {
	        	if (!instance.disabled) {
	            	instance._internalVariables.deleteFile ($(this).attr("data-index"));
	        	}
	        });
	        instance.elements.uploaderResultElement.fadeIn();


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
			if (curError.error == "invalid_file_extension") {
				curErrorText = instance.errors.invalidFileExtension;
			} else if (curError.error == "invalid_file_size") {
				curErrorText = instance.errors.invalidFileSize;
			} else if (curError.error == "upload_failed") {
				curErrorText = instance.errors.uploadFailed;
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
		instance.elements.uploaderResultElement.addClass("error");
		instance.elements.uploaderResultElement.html(errorStr).stop().css("display", "none").fadeIn();
		instance._internalVariables.abortAndCancelUpload();
		if (typeof (instance.onError) == "function") {
    		instance.onError (errors);
    	}
	    instance._internalVariables.hoverOnBtn = false;
    	instance._internalVariables.checkDragFileStates();
    	clearTimeout(instance._internalVariables.displayErrorAnimationTimeoutDuration);
    	instance._internalVariables.displayErrorAnimationTimeoutDuration = setTimeout(function () {
    		instance.elements.uploaderResultElement.fadeOut(function () {
    			instance._internalVariables.showCurrentFiles();
    		});
    	}, instance.displayErrorDuration);
	}

	//
	//
	//	Utils
	//
	//
	/*
	this._internalVariables.jsonp = function (url, callback) {
	    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
	    window[callbackName] = function(data) {
	        delete window[callbackName];
	        document.body.removeChild(script);
	        callback(data);
	    };
	    var script = document.createElement('script');
	    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
	    document.body.appendChild(script);
	}
	*/

	this._internalVariables.consoleError = function (errorText) {
		
		var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
		var isIE = navigator.userAgent.indexOf("MSIE") != -1;
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

	this._internalVariables.imageFileTypes = ['.jpg','.jpeg','.png','.tiff','.bmp'];

	this._internalVariables.isFileType = function (file, curFileTypes) {

		var fileExtension = file.substr(file.lastIndexOf("."), 5);
		fileExtension = fileExtension.toLowerCase();
	    var result = ($.inArray(fileExtension.toLowerCase(), curFileTypes) != -1);
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

	this._internalVariables.validateIframeGatewayPath = function () {
		var instance = this.instance;
		var iframeGatewayFullUrl = window.location.href.substr(0, window.location.href.lastIndexOf("/"))+"/"+instance.iframeGateway;
		$.ajax({
			type: "HEAD",
			url: iframeGatewayFullUrl,
			success: function(data) {
			},
			error: function(jqXHR, exception) {
				instance._internalVariables.consoleError("Iframe gateway can't be found at "+iframeGatewayFullUrl);
			}
		});
	};

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
	    	$("iframe[data-request='"+iframeIndex+"']").remove();
	    }
	},

	uploadViaIframeGateway: function (formElementId, scriptUrl, iframeGatewayUrl, onCompleted) {
		
		var requestId = Math.floor(Math.random()*999999999);
		var iframeObj = new Object();
	    iframeObj.closed = false;
	    iframeObj.actionCompletedFunc = onCompleted;
	    uploaerIframeGateway.objs[requestId] = iframeObj;
	    
	    var iframeId = "uploader_gateway_iframe_"+formElementId;
	    if ($("#"+iframeId).get(0) == null) {
	    	var iframeElement = "<iframe id='"+iframeId+"' data-request='"+requestId+"' name='"+iframeId+"' style='width: 1px; height: 1px; opacity: 0; display: none;'>";
	    	$(iframeElement).appendTo('body');
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

		$('#'+formElementId)
		.attr('action', formAction)
		.attr('target', iframeId)
		.attr('enctype', "multipart/form-data")
		.attr('method', "post");
		$('#'+formElementId).get(0).submit();

	},

	cancelUpload: function (formElementId, scriptUrl) {
		
	    var iframeId = "uploader_gateway_iframe_"+formElementId;
	    var formAction = scriptUrl;
	    if ($("#"+iframeId).get(0) == null) {
	    	var iframeElement = "<iframe id='"+iframeId+"' name='"+iframeId+"' style='width: 1px; height: 1px; opacity: 0; display: none;'>";
	    	$(iframeElement).appendTo('body');
	    }
		$('#'+formElementId)
		.attr('action', formAction)
		.attr('target', iframeId)
		.attr('enctype', "multipart/form-data")
		.attr('method', "get");
		$('#'+formElementId).get(0).submit();
	    
	}

}
// IE8 polyfill for Object.defineProperty (works partially - only "get" and "set", without triggering functions)
if (!Object.defineProperty ||
      !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
	Object.defineProperty = function defineProperty(object, property, descriptor) {
        descriptor._internalVariables = {
        	setVariable: function () {
        	}
        };
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


/*
 * Javascript EXIF Reader - jQuery plugin 0.1.3
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */

(function($) {


var BinaryFile = function(strData, iDataOffset, iDataLength) {
    var data = strData;
    var dataOffset = iDataOffset || 0;
    var dataLength = 0;

    this.getRawData = function() {
        return data;
    };

    if (typeof strData == "string") {
        dataLength = iDataLength || data.length;

        this.getByteAt = function(iOffset) {
            return data.charCodeAt(iOffset + dataOffset) & 0xFF;
        };
    } else if (typeof strData == "unknown") {
        dataLength = iDataLength || IEBinary_getLength(data);

        this.getByteAt = function(iOffset) {
            return IEBinary_getByteAt(data, iOffset + dataOffset);
        };
    }

    this.getLength = function() {
        return dataLength;
    };

    this.getSByteAt = function(iOffset) {
        var iByte = this.getByteAt(iOffset);
        if (iByte > 127)
            return iByte - 256;
        else
            return iByte;
    };

    this.getShortAt = function(iOffset, bBigEndian) {
        var iShort = bBigEndian ?
            (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
            : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset);
        if (iShort < 0) iShort += 65536;
        return iShort;
    };
    this.getSShortAt = function(iOffset, bBigEndian) {
        var iUShort = this.getShortAt(iOffset, bBigEndian);
        if (iUShort > 32767)
            return iUShort - 65536;
        else
            return iUShort;
    };
    this.getLongAt = function(iOffset, bBigEndian) {
        var iByte1 = this.getByteAt(iOffset),
            iByte2 = this.getByteAt(iOffset + 1),
            iByte3 = this.getByteAt(iOffset + 2),
            iByte4 = this.getByteAt(iOffset + 3);

        var iLong = bBigEndian ?
            (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
            : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
        if (iLong < 0) iLong += 4294967296;
        return iLong;
    };
    this.getSLongAt = function(iOffset, bBigEndian) {
        var iULong = this.getLongAt(iOffset, bBigEndian);
        if (iULong > 2147483647)
            return iULong - 4294967296;
        else
            return iULong;
    };
    this.getStringAt = function(iOffset, iLength) {
        var aStr = [];
        for (var i=iOffset,j=0;i<iOffset+iLength;i++,j++) {
            aStr[j] = String.fromCharCode(this.getByteAt(i));
        }
        return aStr.join("");
    };

    this.getCharAt = function(iOffset) {
        return String.fromCharCode(this.getByteAt(iOffset));
    };
    this.toBase64 = function() {
        return window.btoa(data);
    };
    this.fromBase64 = function(strBase64) {
        data = window.atob(strBase64);
    };
};


var BinaryAjax = (function() {

    function createRequest() {
        var oHTTP = null;
        if (window.XMLHttpRequest) {
            oHTTP = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            oHTTP = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return oHTTP;
    }

    function getHead(strURL, fncCallback, fncError) {
        var oHTTP = createRequest();
        if (oHTTP) {
            if (fncCallback) {
                if (typeof(oHTTP.onload) != "undefined") {
                    oHTTP.onload = function() {
                        if (oHTTP.status == "200") {
                            fncCallback(this);
                        } else {
                            if (fncError) fncError();
                        }
                        oHTTP = null;
                    };
                } else {
                    oHTTP.onreadystatechange = function() {
                        if (oHTTP.readyState == 4) {
                            if (oHTTP.status == "200") {
                                fncCallback(this);
                            } else {
                                if (fncError) fncError();
                            }
                            oHTTP = null;
                        }
                    };
                }
            }
            oHTTP.open("HEAD", strURL, true);
            oHTTP.send(null);
        } else {
            if (fncError) fncError();
        }
    }

    function sendRequest(strURL, fncCallback, fncError, aRange, bAcceptRanges, iFileSize) {
        var oHTTP = createRequest();
        if (oHTTP) {

            var iDataOffset = 0;
            if (aRange && !bAcceptRanges) {
                iDataOffset = aRange[0];
            }
            var iDataLen = 0;
            if (aRange) {
                iDataLen = aRange[1]-aRange[0]+1;
            }

            if (fncCallback) {
                if (typeof(oHTTP.onload) != "undefined") {
                    oHTTP.onload = function() {

                        if (oHTTP.status == "200" || oHTTP.status == "206" || oHTTP.status == "0") {
                            this.binaryResponse = new BinaryFile(this.responseText, iDataOffset, iDataLen);
                            this.fileSize = iFileSize || this.getResponseHeader("Content-Length");
                            fncCallback(this);
                        } else {
                            if (fncError) fncError();
                        }
                        oHTTP = null;
                    };
                } else {
                    oHTTP.onreadystatechange = function() {
                        if (oHTTP.readyState == 4) {
                            if (oHTTP.status == "200" || oHTTP.status == "206" || oHTTP.status == "0") {
                                this.binaryResponse = new BinaryFile(oHTTP.responseBody, iDataOffset, iDataLen);
                                this.fileSize = iFileSize || this.getResponseHeader("Content-Length");
                                fncCallback(this);
                            } else {
                                if (fncError) fncError();
                            }
                            oHTTP = null;
                        }
                    };
                }
            }
            oHTTP.open("GET", strURL, true);

            if (oHTTP.overrideMimeType) oHTTP.overrideMimeType('text/plain; charset=x-user-defined');

            if (aRange && bAcceptRanges) {
                oHTTP.setRequestHeader("Range", "bytes=" + aRange[0] + "-" + aRange[1]);
            }

            oHTTP.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 1970 00:00:00 GMT");

            oHTTP.send(null);
        } else {
            if (fncError) fncError();
        }
    }

    return function(strURL, fncCallback, fncError, aRange) {

        if (aRange) {
            getHead(
                strURL,
                function(oHTTP) {
                    var iLength = parseInt(oHTTP.getResponseHeader("Content-Length"),10);
                    var strAcceptRanges = oHTTP.getResponseHeader("Accept-Ranges");

                    var iStart, iEnd;
                    iStart = aRange[0];
                    if (aRange[0] < 0)
                        iStart += iLength;
                    iEnd = iStart + aRange[1] - 1;

                    sendRequest(strURL, fncCallback, fncError, [iStart, iEnd], (strAcceptRanges == "bytes"), iLength);
                }
            );

        } else {
            sendRequest(strURL, fncCallback, fncError);
        }
    };

}());


document.write(
    "<script type='text/vbscript'>\r\n"
    + "Function IEBinary_getByteAt(strBinary, iOffset)\r\n"
    + " IEBinary_getByteAt = AscB(MidB(strBinary,iOffset+1,1))\r\n"
    + "End Function\r\n"
    + "Function IEBinary_getLength(strBinary)\r\n"
    + " IEBinary_getLength = LenB(strBinary)\r\n"
    + "End Function\r\n"
    + "</script>\r\n"
);


var EXIF = {};

(function() {

var bDebug = false;

EXIF.Tags = {

    // version tags
    0x9000 : "ExifVersion",         // EXIF version
    0xA000 : "FlashpixVersion",     // Flashpix format version

    // colorspace tags
    0xA001 : "ColorSpace",          // Color space information tag

    // image configuration
    0xA002 : "PixelXDimension",     // Valid width of meaningful image
    0xA003 : "PixelYDimension",     // Valid height of meaningful image
    0x9101 : "ComponentsConfiguration", // Information about channels
    0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

    // user information
    0x927C : "MakerNote",           // Any desired information written by the manufacturer
    0x9286 : "UserComment",         // Comments by user

    // related file
    0xA004 : "RelatedSoundFile",        // Name of related sound file

    // date and time
    0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
    0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
    0x9290 : "SubsecTime",          // Fractions of seconds for DateTime
    0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
    0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

    // picture-taking conditions
    0x829A : "ExposureTime",        // Exposure time (in seconds)
    0x829D : "FNumber",         // F number
    0x8822 : "ExposureProgram",     // Exposure program
    0x8824 : "SpectralSensitivity",     // Spectral sensitivity
    0x8827 : "ISOSpeedRatings",     // ISO speed rating
    0x8828 : "OECF",            // Optoelectric conversion factor
    0x9201 : "ShutterSpeedValue",       // Shutter speed
    0x9202 : "ApertureValue",       // Lens aperture
    0x9203 : "BrightnessValue",     // Value of brightness
    0x9204 : "ExposureBias",        // Exposure bias
    0x9205 : "MaxApertureValue",        // Smallest F number of lens
    0x9206 : "SubjectDistance",     // Distance to subject in meters
    0x9207 : "MeteringMode",        // Metering mode
    0x9208 : "LightSource",         // Kind of light source
    0x9209 : "Flash",           // Flash status
    0x9214 : "SubjectArea",         // Location and area of main subject
    0x920A : "FocalLength",         // Focal length of the lens in mm
    0xA20B : "FlashEnergy",         // Strobe energy in BCPS
    0xA20C : "SpatialFrequencyResponse",    //
    0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
    0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
    0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
    0xA214 : "SubjectLocation",     // Location of subject in image
    0xA215 : "ExposureIndex",       // Exposure index selected on camera
    0xA217 : "SensingMethod",       // Image sensor type
    0xA300 : "FileSource",          // Image source (3 == DSC)
    0xA301 : "SceneType",           // Scene type (1 == directly photographed)
    0xA302 : "CFAPattern",          // Color filter array geometric pattern
    0xA401 : "CustomRendered",      // Special processing
    0xA402 : "ExposureMode",        // Exposure mode
    0xA403 : "WhiteBalance",        // 1 = auto white balance, 2 = manual
    0xA404 : "DigitalZoomRation",       // Digital zoom ratio
    0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
    0xA406 : "SceneCaptureType",        // Type of scene
    0xA407 : "GainControl",         // Degree of overall image gain adjustment
    0xA408 : "Contrast",            // Direction of contrast processing applied by camera
    0xA409 : "Saturation",          // Direction of saturation processing applied by camera
    0xA40A : "Sharpness",           // Direction of sharpness processing applied by camera
    0xA40B : "DeviceSettingDescription",    //
    0xA40C : "SubjectDistanceRange",    // Distance to subject

    // other tags
    0xA005 : "InteroperabilityIFDPointer",
    0xA420 : "ImageUniqueID"        // Identifier assigned uniquely to each image
};

EXIF.TiffTags = {
    0x0100 : "ImageWidth",
    0x0101 : "ImageHeight",
    0x8769 : "ExifIFDPointer",
    0x8825 : "GPSInfoIFDPointer",
    0xA005 : "InteroperabilityIFDPointer",
    0x0102 : "BitsPerSample",
    0x0103 : "Compression",
    0x0106 : "PhotometricInterpretation",
    0x0112 : "Orientation",
    0x0115 : "SamplesPerPixel",
    0x011C : "PlanarConfiguration",
    0x0212 : "YCbCrSubSampling",
    0x0213 : "YCbCrPositioning",
    0x011A : "XResolution",
    0x011B : "YResolution",
    0x0128 : "ResolutionUnit",
    0x0111 : "StripOffsets",
    0x0116 : "RowsPerStrip",
    0x0117 : "StripByteCounts",
    0x0201 : "JPEGInterchangeFormat",
    0x0202 : "JPEGInterchangeFormatLength",
    0x012D : "TransferFunction",
    0x013E : "WhitePoint",
    0x013F : "PrimaryChromaticities",
    0x0211 : "YCbCrCoefficients",
    0x0214 : "ReferenceBlackWhite",
    0x0132 : "DateTime",
    0x010E : "ImageDescription",
    0x010F : "Make",
    0x0110 : "Model",
    0x0131 : "Software",
    0x013B : "Artist",
    0x8298 : "Copyright"
};

EXIF.GPSTags = {
    0x0000 : "GPSVersionID",
    0x0001 : "GPSLatitudeRef",
    0x0002 : "GPSLatitude",
    0x0003 : "GPSLongitudeRef",
    0x0004 : "GPSLongitude",
    0x0005 : "GPSAltitudeRef",
    0x0006 : "GPSAltitude",
    0x0007 : "GPSTimeStamp",
    0x0008 : "GPSSatellites",
    0x0009 : "GPSStatus",
    0x000A : "GPSMeasureMode",
    0x000B : "GPSDOP",
    0x000C : "GPSSpeedRef",
    0x000D : "GPSSpeed",
    0x000E : "GPSTrackRef",
    0x000F : "GPSTrack",
    0x0010 : "GPSImgDirectionRef",
    0x0011 : "GPSImgDirection",
    0x0012 : "GPSMapDatum",
    0x0013 : "GPSDestLatitudeRef",
    0x0014 : "GPSDestLatitude",
    0x0015 : "GPSDestLongitudeRef",
    0x0016 : "GPSDestLongitude",
    0x0017 : "GPSDestBearingRef",
    0x0018 : "GPSDestBearing",
    0x0019 : "GPSDestDistanceRef",
    0x001A : "GPSDestDistance",
    0x001B : "GPSProcessingMethod",
    0x001C : "GPSAreaInformation",
    0x001D : "GPSDateStamp",
    0x001E : "GPSDifferential"
};

EXIF.StringValues = {
    ExposureProgram : {
        0 : "Not defined",
        1 : "Manual",
        2 : "Normal program",
        3 : "Aperture priority",
        4 : "Shutter priority",
        5 : "Creative program",
        6 : "Action program",
        7 : "Portrait mode",
        8 : "Landscape mode"
    },
    MeteringMode : {
        0 : "Unknown",
        1 : "Average",
        2 : "CenterWeightedAverage",
        3 : "Spot",
        4 : "MultiSpot",
        5 : "Pattern",
        6 : "Partial",
        255 : "Other"
    },
    LightSource : {
        0 : "Unknown",
        1 : "Daylight",
        2 : "Fluorescent",
        3 : "Tungsten (incandescent light)",
        4 : "Flash",
        9 : "Fine weather",
        10 : "Cloudy weather",
        11 : "Shade",
        12 : "Daylight fluorescent (D 5700 - 7100K)",
        13 : "Day white fluorescent (N 4600 - 5400K)",
        14 : "Cool white fluorescent (W 3900 - 4500K)",
        15 : "White fluorescent (WW 3200 - 3700K)",
        17 : "Standard light A",
        18 : "Standard light B",
        19 : "Standard light C",
        20 : "D55",
        21 : "D65",
        22 : "D75",
        23 : "D50",
        24 : "ISO studio tungsten",
        255 : "Other"
    },
    Flash : {
        0x0000 : "Flash did not fire",
        0x0001 : "Flash fired",
        0x0005 : "Strobe return light not detected",
        0x0007 : "Strobe return light detected",
        0x0009 : "Flash fired, compulsory flash mode",
        0x000D : "Flash fired, compulsory flash mode, return light not detected",
        0x000F : "Flash fired, compulsory flash mode, return light detected",
        0x0010 : "Flash did not fire, compulsory flash mode",
        0x0018 : "Flash did not fire, auto mode",
        0x0019 : "Flash fired, auto mode",
        0x001D : "Flash fired, auto mode, return light not detected",
        0x001F : "Flash fired, auto mode, return light detected",
        0x0020 : "No flash function",
        0x0041 : "Flash fired, red-eye reduction mode",
        0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
        0x0047 : "Flash fired, red-eye reduction mode, return light detected",
        0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
        0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
        0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
        0x0059 : "Flash fired, auto mode, red-eye reduction mode",
        0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
        0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
    },
    SensingMethod : {
        1 : "Not defined",
        2 : "One-chip color area sensor",
        3 : "Two-chip color area sensor",
        4 : "Three-chip color area sensor",
        5 : "Color sequential area sensor",
        7 : "Trilinear sensor",
        8 : "Color sequential linear sensor"
    },
    SceneCaptureType : {
        0 : "Standard",
        1 : "Landscape",
        2 : "Portrait",
        3 : "Night scene"
    },
    SceneType : {
        1 : "Directly photographed"
    },
    CustomRendered : {
        0 : "Normal process",
        1 : "Custom process"
    },
    WhiteBalance : {
        0 : "Auto white balance",
        1 : "Manual white balance"
    },
    GainControl : {
        0 : "None",
        1 : "Low gain up",
        2 : "High gain up",
        3 : "Low gain down",
        4 : "High gain down"
    },
    Contrast : {
        0 : "Normal",
        1 : "Soft",
        2 : "Hard"
    },
    Saturation : {
        0 : "Normal",
        1 : "Low saturation",
        2 : "High saturation"
    },
    Sharpness : {
        0 : "Normal",
        1 : "Soft",
        2 : "Hard"
    },
    SubjectDistanceRange : {
        0 : "Unknown",
        1 : "Macro",
        2 : "Close view",
        3 : "Distant view"
    },
    FileSource : {
        3 : "DSC"
    },

    Components : {
        0 : "",
        1 : "Y",
        2 : "Cb",
        3 : "Cr",
        4 : "R",
        5 : "G",
        6 : "B"
    }
};

function addEvent(oElement, strEvent, fncHandler)
{
    if (oElement.addEventListener) {
        oElement.addEventListener(strEvent, fncHandler, false);
    } else if (oElement.attachEvent) {
        oElement.attachEvent("on" + strEvent, fncHandler);
    }
}


function imageHasData(oImg)
{
    return !!(oImg.exifdata);
}

function getImageData(oImg, fncCallback)
{
    BinaryAjax(
        oImg.src,
        function(oHTTP) {
            var oEXIF = findEXIFinJPEG(oHTTP.binaryResponse);
            oImg.exifdata = oEXIF || {};
            if (fncCallback) fncCallback();
        }
    );
}

function findEXIFinJPEG(oFile) {
    var aMarkers = [];

    if (oFile.getByteAt(0) != 0xFF || oFile.getByteAt(1) != 0xD8) {
        return false; // not a valid jpeg
    }

    var iOffset = 2;
    var iLength = oFile.getLength();
    while (iOffset < iLength) {
        if (oFile.getByteAt(iOffset) != 0xFF) {
            if (bDebug) console.log("Not a valid marker at offset " + iOffset + ", found: " + oFile.getByteAt(iOffset));
            return false; // not a valid marker, something is wrong
        }

        var iMarker = oFile.getByteAt(iOffset+1);

        // we could implement handling for other markers here,
        // but we're only looking for 0xFFE1 for EXIF data

        if (iMarker == 22400) {
            if (bDebug) console.log("Found 0xFFE1 marker");
            return readEXIFData(oFile, iOffset + 4, oFile.getShortAt(iOffset+2, true)-2);
            // iOffset += 2 + oFile.getShortAt(iOffset+2, true);
            // WTF?

        } else if (iMarker == 225) {
            // 0xE1 = Application-specific 1 (for EXIF)
            if (bDebug) console.log("Found 0xFFE1 marker");
            return readEXIFData(oFile, iOffset + 4, oFile.getShortAt(iOffset+2, true)-2);

        } else {
            iOffset += 2 + oFile.getShortAt(iOffset+2, true);
        }

    }

}


function readTags(oFile, iTIFFStart, iDirStart, oStrings, bBigEnd)
{
    var iEntries = oFile.getShortAt(iDirStart, bBigEnd);
    var oTags = {};
    for (var i=0;i<iEntries;i++) {
        var iEntryOffset = iDirStart + i*12 + 2;
        var strTag = oStrings[oFile.getShortAt(iEntryOffset, bBigEnd)];
        if (!strTag && bDebug) console.log("Unknown tag: " + oFile.getShortAt(iEntryOffset, bBigEnd));
        oTags[strTag] = readTagValue(oFile, iEntryOffset, iTIFFStart, iDirStart, bBigEnd);
    }
    return oTags;
}


function readTagValue(oFile, iEntryOffset, iTIFFStart, iDirStart, bBigEnd)
{
    var iType = oFile.getShortAt(iEntryOffset+2, bBigEnd);
    var iNumValues = oFile.getLongAt(iEntryOffset+4, bBigEnd);
    var iValueOffset = oFile.getLongAt(iEntryOffset+8, bBigEnd) + iTIFFStart;

    switch (iType) {
        case 1: // byte, 8-bit unsigned int
        case 7: // undefined, 8-bit byte, value depending on field
            if (iNumValues == 1) {
                return oFile.getByteAt(iEntryOffset + 8, bBigEnd);
            } else {
                var iValOffset = iNumValues > 4 ? iValueOffset : (iEntryOffset + 8);
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getByteAt(iValOffset + n);
                }
                return aVals;
            }
            break;

        case 2: // ascii, 8-bit byte
            var iStringOffset = iNumValues > 4 ? iValueOffset : (iEntryOffset + 8);
            return oFile.getStringAt(iStringOffset, iNumValues-1);
            // break;

        case 3: // short, 16 bit int
            if (iNumValues == 1) {
                return oFile.getShortAt(iEntryOffset + 8, bBigEnd);
            } else {
                var iValOffset = iNumValues > 2 ? iValueOffset : (iEntryOffset + 8);
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getShortAt(iValOffset + 2*n, bBigEnd);
                }
                return aVals;
            }
            // break;

        case 4: // long, 32 bit int
            if (iNumValues == 1) {
                return oFile.getLongAt(iEntryOffset + 8, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getLongAt(iValueOffset + 4*n, bBigEnd);
                }
                return aVals;
            }
            break;
        case 5: // rational = two long values, first is numerator, second is denominator
            if (iNumValues == 1) {
                return oFile.getLongAt(iValueOffset, bBigEnd) / oFile.getLongAt(iValueOffset+4, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getLongAt(iValueOffset + 8*n, bBigEnd) / oFile.getLongAt(iValueOffset+4 + 8*n, bBigEnd);
                }
                return aVals;
            }
            break;
        case 9: // slong, 32 bit signed int
            if (iNumValues == 1) {
                return oFile.getSLongAt(iEntryOffset + 8, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getSLongAt(iValueOffset + 4*n, bBigEnd);
                }
                return aVals;
            }
            break;
        case 10: // signed rational, two slongs, first is numerator, second is denominator
            if (iNumValues == 1) {
                return oFile.getSLongAt(iValueOffset, bBigEnd) / oFile.getSLongAt(iValueOffset+4, bBigEnd);
            } else {
                var aVals = [];
                for (var n=0;n<iNumValues;n++) {
                    aVals[n] = oFile.getSLongAt(iValueOffset + 8*n, bBigEnd) / oFile.getSLongAt(iValueOffset+4 + 8*n, bBigEnd);
                }
                return aVals;
            }
            break;
    }
}


function readEXIFData(oFile, iStart, iLength)
{
    if (oFile.getStringAt(iStart, 4) != "Exif") {
        if (bDebug) console.log("Not valid EXIF data! " + oFile.getStringAt(iStart, 4));
        return false;
    }

    var bBigEnd;

    var iTIFFOffset = iStart + 6;

    // test for TIFF validity and endianness
    if (oFile.getShortAt(iTIFFOffset) == 0x4949) {
        bBigEnd = false;
    } else if (oFile.getShortAt(iTIFFOffset) == 0x4D4D) {
        bBigEnd = true;
    } else {
        if (bDebug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
        return false;
    }

    if (oFile.getShortAt(iTIFFOffset+2, bBigEnd) != 0x002A) {
        if (bDebug) console.log("Not valid TIFF data! (no 0x002A)");
        return false;
    }

    if (oFile.getLongAt(iTIFFOffset+4, bBigEnd) != 0x00000008) {
        if (bDebug) console.log("Not valid TIFF data! (First offset not 8)", oFile.getShortAt(iTIFFOffset+4, bBigEnd));
        return false;
    }

    var oTags = readTags(oFile, iTIFFOffset, iTIFFOffset+8, EXIF.TiffTags, bBigEnd);

    if (oTags.ExifIFDPointer) {
        var oEXIFTags = readTags(oFile, iTIFFOffset, iTIFFOffset + oTags.ExifIFDPointer, EXIF.Tags, bBigEnd);
        for (var strTag in oEXIFTags) {
            switch (strTag) {
                case "LightSource" :
                case "Flash" :
                case "MeteringMode" :
                case "ExposureProgram" :
                case "SensingMethod" :
                case "SceneCaptureType" :
                case "SceneType" :
                case "CustomRendered" :
                case "WhiteBalance" :
                case "GainControl" :
                case "Contrast" :
                case "Saturation" :
                case "Sharpness" :
                case "SubjectDistanceRange" :
                case "FileSource" :
                    oEXIFTags[strTag] = EXIF.StringValues[strTag][oEXIFTags[strTag]];
                    break;

                case "ExifVersion" :
                case "FlashpixVersion" :
                    oEXIFTags[strTag] = String.fromCharCode(oEXIFTags[strTag][0], oEXIFTags[strTag][1], oEXIFTags[strTag][2], oEXIFTags[strTag][3]);
                    break;

                case "ComponentsConfiguration" :
                    oEXIFTags[strTag] =
                        EXIF.StringValues.Components[oEXIFTags[strTag][0]]
                        + EXIF.StringValues.Components[oEXIFTags[strTag][1]]
                        + EXIF.StringValues.Components[oEXIFTags[strTag][2]]
                        + EXIF.StringValues.Components[oEXIFTags[strTag][3]];
                    break;
            }
            oTags[strTag] = oEXIFTags[strTag];
        }
    }

    if (oTags.GPSInfoIFDPointer) {
        var oGPSTags = readTags(oFile, iTIFFOffset, iTIFFOffset + oTags.GPSInfoIFDPointer, EXIF.GPSTags, bBigEnd);
        for (var strTag in oGPSTags) {
            switch (strTag) {
                case "GPSVersionID" :
                    oGPSTags[strTag] = oGPSTags[strTag][0]
                        + "." + oGPSTags[strTag][1]
                        + "." + oGPSTags[strTag][2]
                        + "." + oGPSTags[strTag][3];
                    break;
            }
            oTags[strTag] = oGPSTags[strTag];
        }
    }

    return oTags;
}


EXIF.getData = function(oImg, fncCallback)
{
    if (!oImg.complete) return false;
    if (!imageHasData(oImg)) {
        getImageData(oImg, fncCallback);
    } else {
        if (fncCallback) fncCallback();
    }
    return true;
};

EXIF.getTag = function(oImg, strTag)
{
    if (!imageHasData(oImg)) return;
    return oImg.exifdata[strTag];
};

EXIF.getAllTags = function(oImg)
{
    if (!imageHasData(oImg)) return {};
    var oData = oImg.exifdata;
    var oAllTags = {};
    for (var a in oData) {
        if (oData.hasOwnProperty(a)) {
            oAllTags[a] = oData[a];
        }
    }
    return oAllTags;
};

EXIF.pretty = function(oImg)
{
    if (!imageHasData(oImg)) return "";
    var oData = oImg.exifdata;
    var strPretty = "";
    for (var a in oData) {
        if (oData.hasOwnProperty(a)) {
            if (typeof oData[a] == "object") {
                strPretty += a + " : [" + oData[a].length + " values]\r\n";
            } else {
                strPretty += a + " : " + oData[a] + "\r\n";
            }
        }
    }
    return strPretty;
};

EXIF.readFromBinaryFile = function(oFile) {
    return findEXIFinJPEG(oFile);
};

// function loadAllImages()
// {
//     var aImages = document.getElementsByTagName("img");
//     var callb = function() {
//         EXIF.getData(this);
//     };
//     for (var i=0;i<aImages.length;i++) {
//         if (aImages[i].getAttribute("exif") == "true") {
//             if (!aImages[i].complete) {
//                 addEvent(aImages[i], "load", callb);
//             } else {
//                 EXIF.getData(aImages[i]);
//             }
//         }
//     }
// }

// automatically load exif data for all images with exif=true when doc is ready
// $(document).ready(loadAllImages);

// load data for images manually
$.fn.exifLoad = function(fncCallback) {
    return this.each(function() {
        EXIF.getData(this, fncCallback);
    });
};

$.fn.exif = function(strTag) {
    var aStrings = [];
    this.each(function() {
        aStrings.push(EXIF.getTag(this, strTag));
    });
    return aStrings;
};

$.fn.exifAll = function() {
    var aStrings = [];
    this.each(function() {
        aStrings.push(EXIF.getAllTags(this));
    });
    return aStrings;
};

$.fn.exifPretty = function() {
    var aStrings = [];
    this.each(function() {
        aStrings.push(EXIF.pretty(this));
    });
    return aStrings;
};

var getFilePart = function(file) {
    if (file.slice) {
        filePart = file.slice(0, 131072);
    } else if (file.webkitSlice) {
        filePart = file.webkitSlice(0, 131072);
    } else if (file.mozSlice) {
        filePart = file.mozSlice(0, 131072);
    } else {
        filePart = file;
    }

    return filePart;
};

$.fn.fileExif = function(callback) {
    var reader = new FileReader();

    reader.onload = function(event) {
        var content = event.target.result;

        var binaryResponse = new BinaryFile(content);

        callback(EXIF.readFromBinaryFile(binaryResponse));
    };

    reader.readAsBinaryString(getFilePart(this[0].files[0]));
};

$.fileExif = function(file, callback) {
    var reader = new FileReader();

    reader.onload = function(event) {
        var content = event.target.result;

        var binaryResponse = new BinaryFile(content);

        callback(EXIF.readFromBinaryFile(binaryResponse));
    };

    reader.readAsBinaryString(getFilePart(file));
};

$.exifReadFromBinaryFile = function(binary) {
    return EXIF.readFromBinaryFile(binary);
};

})();

})(jQuery);


var keyStr = "ABCDEFGHIJKLMNOP" +
               "QRSTUVWXYZabcdef" +
               "ghijklmnopqrstuv" +
               "wxyz0123456789+/" +
               "=";
			   
function decode64(input) {
	var output = "";
	var chr1, chr2, chr3 = "";
	var enc1, enc2, enc3, enc4 = "";
	var i = 0;
	
	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	var base64test = /[^A-Za-z0-9\+\/\=]/g;
	if (base64test.exec(input)) {
		console.log("There were invalid base64 characters in the input text.\n" +
		  "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
		  "Expect errors in decoding.");
	}
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
	do {
		enc1 = keyStr.indexOf(input.charAt(i++));
		enc2 = keyStr.indexOf(input.charAt(i++));
		enc3 = keyStr.indexOf(input.charAt(i++));
		enc4 = keyStr.indexOf(input.charAt(i++));
		
		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;
		
		output = output + String.fromCharCode(chr1);
		
		if (enc3 != 64) {
		   output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
		   output = output + String.fromCharCode(chr3);
		}
		
		chr1 = chr2 = chr3 = "";
		enc1 = enc2 = enc3 = enc4 = "";
		
		} while (i < input.length);
		
	return unescape(output);
}

function getExifData(image_result) {
	var data = image_result.replace("data:image/jpeg;base64,", "");
	var decoded_data = decode64(data);
	
	getLongAt = function(iOffset, bBigEndian) {
				var iByte1 = decoded_data.charCodeAt(iOffset),
					iByte2 = decoded_data.charCodeAt(iOffset + 1),
					iByte3 = decoded_data.charCodeAt(iOffset + 2),
					iByte4 = decoded_data.charCodeAt(iOffset + 3);

				var iLong = bBigEndian ? 
					(((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
					: (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
				if (iLong < 0) iLong += 4294967296;
				return iLong;
			};
	
	getSLongAt = function(iOffset, bBigEndian) {
		var iULong = getLongAt(iOffset, bBigEndian);
		if (iULong > 2147483647)
			return iULong - 4294967296;
		else
			return iULong;
	};
	
	var result = $.exifReadFromBinaryFile({ 
		getByteAt: function(idx) { return decoded_data.charCodeAt(idx); },
		getLength: function() { return decoded_data.length; },
		getShortAt: function(iOffset, bBigEndian) {
				var iShort = bBigEndian ? 
					(decoded_data.charCodeAt(iOffset) << 8) + decoded_data.charCodeAt(iOffset + 1)
					: (decoded_data.charCodeAt(iOffset + 1) << 8) + decoded_data.charCodeAt(iOffset)
				if (iShort < 0) iShort += 65536;
				return iShort;
			},
		getStringAt: function(a, b) { return decoded_data.substring(a, a+b); },
		getLongAt: getLongAt,
		getSLongAt: getSLongAt
	});
	return result;
}