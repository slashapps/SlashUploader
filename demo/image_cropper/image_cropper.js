
var ImageCropper = {

    rotateSliderTotalWidth: 2200,

    rotateSliderBlankPixelsWidth: 200,

    pagesFadeSpeed: 300,

    addCropperPopupHtmlToDom: function () {

        if (document.getElementById('cropper_popup') == null) {

            var cropPopupHtml = '\
			<div id="cropper_popup">\
				<div id="cropper_container">\
					<canvas id="cropper_canvas" style="opacity: 0;">\
						Your browser does not support the HTML5 canvas element.\
					</canvas>\
					<div id="cropper_loading">\
						<div id="cropper_loading_animation">Loading...</div>\
					</div>\
				</div>\
				<div id="cropper_buttons">\
					<div id="cropper_rotation_slider">\
						<div class="cropper_slides_wrapper">\
							<div id="cropper_slides">\
								<span id="cropper_degree_slider"></span>\
							</div>\
						</div>\
					</div>\
					<span class="cropper_btn cropper_btn_resize_enlarge"><span></span>Enlarge</span>\
					<span class="cropper_btn cropper_btn_resize_reduce"><span></span>Reduce</span>\
					<span class="cropper_btn_sep_1"></span>\
					<span class="cropper_btn cropper_btn_flip_horizontal"><span></span>Flip Horizontal</span>\
					<span class="cropper_btn cropper_btn_flip_vertical"><span></span>Flip Vertical</span>\
					<span class="cropper_btn_sep_2"></span>\
					<span class="cropper_btn cropper_btn_crop"><span></span>Save</span>\
					<span class="cropper_btn cropper_btn_reset"><span></span>Reset</span>\
					<span class="cropper_btn cropper_btn_cancel"><span></span>Cancel</span>\
				</div>\
			</div>';
            $("body").append(cropPopupHtml);

            setTimeout(function () {
                var slideWidth = (ImageCropper.rotateSliderTotalWidth - ImageCropper.rotateSliderBlankPixelsWidth * 2) / 2;
                document.getElementById('cropper_slides').style.left = Math.floor((document.getElementById('cropper_rotation_slider').offsetWidth / 2 - ImageCropper.rotateSliderBlankPixelsWidth) - slideWidth) + "px";
            }, 1);

        }

    },

    startCropImages: function (files, openerUploader, cropSizeRatio, onCompleted) {

        ImageCropper.addCropperPopupHtmlToDom();
        $("#cropper_popup").fadeIn(ImageCropper.pagesFadeSpeed, function () {
            ImageCropper.cropCurrentImage(files, 0, openerUploader, cropSizeRatio, function () {
                $("#cropper_popup").fadeOut(ImageCropper.pagesFadeSpeed, function () {
                    onCompleted();
                    $("#cropper_popup").remove();
                });
            });
        });

    },

    cropCurrentImage: function (selectedFiles, fileIndex, openerUploader, cropSizeRatio, onCompleted) {

        var curFileData = selectedFiles[fileIndex];
        var curFile = selectedFiles[fileIndex].file;
        if (curFile.type.match(/^image\//)) {

            document.getElementById('cropper_loading').style.display = "block";
            document.getElementById('cropper_canvas').style.opacity = "0";
            document.getElementById('cropper_canvas').style.height = "150px";
            document.getElementById("cropper_container").style.height = (window.innerHeight - 135) + "px";

            var initAngle = 0;
            if (!isNaN(curFileData.rotation) && curFileData.rotation > 0) {
                initAngle = curFileData.rotation;
                if (initAngle > 180) {
                    initAngle -= 360;
                } else if (initAngle < -180) {
                    initAngle += 360;
                }
            }

            var reader = new FileReader();
            reader.onload = function (evt) {
                var img = new Image();
                img.onload = function () {
                    document.getElementById('cropper_loading').style.display = "none";
                    var canvas = document.getElementById('cropper_canvas');
                    context = canvas.getContext("2d");
                    context.canvas.height = img.height;
                    context.canvas.width = img.width;
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, 0, 0);
                    cropper = new Cropper(canvas, {
                        aspectRatio: cropSizeRatio,
                        viewMode: isMobile ? 0 : 2,
                        dragMode: "move",
                        ready: function () {
                            this.cropper.setData({ "rotate": Math.floor(initAngle) });
                        },
                        crop: function (event) {
                            var fileObj = selectedFiles[fileIndex];
                            fileObj.crop_x = Math.round(event.detail.x);
                            fileObj.crop_y = Math.round(event.detail.y);
                            fileObj.crop_width = Math.round(event.detail.width);
                            fileObj.crop_height = Math.round(event.detail.height);
                            fileObj.crop_rotate = Math.round(event.detail.rotate);
                            fileObj.crop_scaleX = event.detail.scaleX;
                            fileObj.crop_scaleY = event.detail.scaleY;
                        }
                    });
                    ImageCropper.rotateSlider(cropper, initAngle);
                    setTimeout(function () {
                        document.getElementById("cropper_container").style.height = "100%";
                    }, 1);
                };
                img.src = evt.target.result;

                var cropButton = document.querySelector("#cropper_popup .cropper_btn_crop");
                cropButton.onclick = function () {
                    cropper.destroy();
                    var canvas = document.getElementById('cropper_canvas');
                    context = canvas.getContext("2d");
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    if (fileIndex < selectedFiles.length - 1) {
                        ImageCropper.cropCurrentImage(selectedFiles, fileIndex + 1, openerUploader, cropSizeRatio, onCompleted);
                    } else {
                        onCompleted();
                    }
                };

                var resizeEnlargeBtn = document.querySelector("#cropper_popup .cropper_btn_resize_enlarge");
                resizeEnlargeBtn.onclick = function () {
                    cropper.zoom(0.1);
                };
                var resizeReduceBtn = document.querySelector("#cropper_popup .cropper_btn_resize_reduce");
                resizeReduceBtn.onclick = function () {
                    cropper.zoom(-0.1);
                };
                var flipHorizontalBtn = document.querySelector("#cropper_popup .cropper_btn_flip_horizontal");
                flipHorizontalBtn.onclick = function () {
                    cropper.scaleX((cropper.getData().scaleX == -1) ? 1 : -1);
                };
                var flipVerticalBtn = document.querySelector("#cropper_popup .cropper_btn_flip_vertical");
                flipVerticalBtn.onclick = function () {
                    cropper.scaleY((cropper.getData().scaleY == -1) ? 1 : -1);
                };

                var cancelBtn = document.querySelector("#cropper_popup .cropper_btn_cancel");
                cancelBtn.onclick = function () {
                    $("#cropper_popup").fadeOut(ImageCropper.pagesFadeSpeed, function () {
                        cropper.destroy();
                        openerUploader.cancelUpload();
                        $("#cropper_popup").remove();
                    });
                };

                var resetBtn = document.querySelector("#cropper_popup .cropper_btn_reset");
                resetBtn.onclick = function () {
                    cropper.reset();
                    ImageCropper.setRotateSliderAngle(cropper, initAngle);
                };

            };
            reader.readAsDataURL(curFile);


        } else {

            if (fileIndex < selectedFiles.length - 1) {
                ImageCropper.cropCurrentImage(selectedFiles, fileIndex + 1, openerUploader, cropSizeRatio, onCompleted);
            } else {
                onCompleted();
            }

        }

    },

    setRotateSliderAngle: function (cropper, angle) {
        var slider = document.getElementById('cropper_rotation_slider');
        var items = document.getElementById('cropper_slides');
        var slideWidth = (ImageCropper.rotateSliderTotalWidth - ImageCropper.rotateSliderBlankPixelsWidth * 2) / 2;
        items.style.left = Math.floor((angle / -180) * slideWidth + (slider.offsetWidth / 2 - ImageCropper.rotateSliderBlankPixelsWidth) - slideWidth) + "px";
        cropper.setData({ "rotate": Math.floor(angle) });
    },

    rotateSlider: function (cropper, initAngle) {

        var slider = document.getElementById('cropper_rotation_slider'),
            sliderItems = document.getElementById('cropper_slides');


        function slide(items) {

            var posX1 = 0,
                posX2 = 0;

            ImageCropper.setRotateSliderAngle(cropper, initAngle);

            // Mouse events
            items.onmousedown = dragStart;

            // Touch events
            /*
            items.addEventListener('touchstart', dragStart);
            items.addEventListener('touchend', dragEnd);
            items.addEventListener('touchmove', dragAction);
            */
            items.ontouchstart = dragStart;
            items.ontouchend = dragEnd;
            items.ontouchmove = dragAction;

            function dragStart(e) {
                e = e || window.event;
                e.preventDefault();
                posInitial = items.offsetLeft;
                items.className = "dragging";

                if (e.type == 'touchstart') {
                    posX1 = e.touches[0].clientX;
                } else {
                    posX1 = e.clientX;
                    document.onmouseup = dragEnd;
                    document.onmousemove = dragAction;
                }
            }

            function dragAction(e) {
                e = e || window.event;

                if (e.type == 'touchmove') {
                    posX2 = posX1 - e.touches[0].clientX;
                    posX1 = e.touches[0].clientX;
                } else {
                    posX2 = posX1 - e.clientX;
                    posX1 = e.clientX;
                }

                var sliderLeftPosition = (items.offsetLeft - posX2);
                var slideWidth = (ImageCropper.rotateSliderTotalWidth - ImageCropper.rotateSliderBlankPixelsWidth * 2) / 2;
                var degree = (sliderLeftPosition - (slider.offsetWidth / 2 - ImageCropper.rotateSliderBlankPixelsWidth) + slideWidth) / slideWidth * -180;
                if (degree >= -180 && degree <= 180) {
                    items.style.left = (sliderLeftPosition) + "px";
                    cropper.setData({ "rotate": Math.round(degree) });
                }
            }

            function dragEnd(e) {
                items.className = "";
                posFinal = items.offsetLeft;
                document.onmouseup = null;
                document.onmousemove = null;
            }

        }

        slide(sliderItems);
    }

};