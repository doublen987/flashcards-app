import React, { useRef } from 'react';
import tinymce from 'tinymce' 
import { Editor } from '@tinymce/tinymce-react';

import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';

import contentUiCss from 'tinymce/skins/ui/oxide/content.css';
import contentCss from 'tinymce/skins/content/default/content.css';

import "tinymce/plugins/code"
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/table';
import 'tinymce/plugins/template';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/paste';
import "@wiris/mathtype-tinymce5"
import { faPastafarianism } from '@fortawesome/free-solid-svg-icons';




function readURL(input) {
    return () => {
        if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            let thumbnailImg = document.getElementById("post-thumbnail-image");
            thumbnailImg.src = e.target.result;
            thumbnailImg.width = 150;
            thumbnailImg.height = 200;
        };
        reader.readAsDataURL(input.files[0]);
        }
    }
}

function onImageError() {
    //this.onerror=null;
    //if (this.src != '/content/no-image.png') {
        console.log("error!");
        console.log(this);
        this.src = '/content/no-image.png';
        this.width = 150;
        this.height = 200;
    //}
}


function initTinyMCE() {
    tinymce.init({
        selector:'#content-editor',
        plugins: 'codesample image',
        toolbar: 'codesample',
        automatic_uploads: true,
        images_upload_url: '/content/images',
        relative_urls: false,
        file_picker_callback: function (cb, value, meta) {
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');

            /*
            Note: In modern browsers input[type="file"] is functional without
            even adding it to the DOM, but that might not be the case in some older
            or quirky browsers like IE, so you might want to add it to the DOM
            just in case, and visually hide it. And do not forget do remove it
            once you do not need it anymore.
            */

            input.onchange = function () {
                var file = this.files[0];

                var reader = new FileReader();
                reader.onload = function () {
                    /*
                    Note: Now we need to register the blob in TinyMCEs image blob
                    registry. In the next release this part hopefully won't be
                    necessary, as we are looking to handle it internally.
                    */
                    var id = 'blobid' + (new Date()).getTime();
                    var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
                    var base64 = reader.result.split(',')[1];
                    var blobInfo = blobCache.create(id, file, base64);
                    blobCache.add(blobInfo);

                    console.log(blobInfo.blobUri())
                    console.log(file.name)

                    /* call the callback and populate the Title field with the file name */
                    cb(blobInfo.blobUri(), { title: file.name });
                };
                reader.readAsDataURL(file);
            };

            input.click();
        },
        images_upload_handler: function(blobInfo, success, failure) {
            console.log("Uploading image")
            var xhr, formData;
            xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open('POST', '/content/images')
            xhr.onload = function() {
                var json;
                if (xhr.status != 200) {
                    failure('HTTP Error: ' + xhr.status);
                    return;
                }
                json = JSON.parse(xhr.responseText);
                console.log(xhr.responseText)
                console.log(json)
                if (!json || typeof json.location != 'string') {
                    failure('Invalid JSON: ' + xhr.responseText);
                    return;
                }
                success("/content/images/" + json.location);
            };
            
            var jsonImage = JSON.stringify({
                filename: blobInfo.filename(),
                bytes: blobInfo.base64()
            })
            xhr.send(jsonImage)
        },
        init_instance_callback : function(editor) {
            editor.setContent("<p>Hello world!</p>");
        }
    });
}



function ContentEditor(props) {
    const editorRef = useRef(null);
    const log = () => {
        if (editorRef.current) {
          console.log(editorRef.current.getContent());
        }
    };
    

    return (
        <>
        <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            //initialValue="<p>This is the initial content of the editor.</p>"
            onEditorChange={props.onChange}
            value={props.value}
            init={{
            height: 500,
            menubar: false,
            plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks codesample fullscreen code',
                'insertdatetime media table paste codesample help wordcount tiny_mce_wiris'
            ],
            toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | image | codesample |' +
            'tiny_mce_wiris_formulaEditor | tiny_mce_wiris_formulaEditorChemistry | code',
            skin: false,
            content_css: false,
            content_style: contentUiCss.toString() + '\n' + contentCss.toString(),
            //   external_plugins: {
            //     'tiny_mce_wiris': `../node_modules/@wiris/mathtype-tinymce5/plugin.min.js`,
            //   },
            htmlAllowedTags: ['.*'],
            htmlAllowedAttrs: ['.*'],
            draggable_modal: true,

            }}
        />
      {/* <button onClick={log}>Log editor content</button> */}
      </>)
}

export default ContentEditor;