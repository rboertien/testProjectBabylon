import { VRExperienceHelper, ActionManager, StandardMaterial, VideoTexture } from "babylonjs";
import {Stage} from "../../src/stage"

var shell:any = (<any>window).shell

var makeNotPickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = false;
    mesh.getChildMeshes().forEach((m)=>{
        makeNotPickable(m)
    })
}

var makePickable = (mesh:BABYLON.AbstractMesh)=>{
    mesh.isPickable = true;
    mesh.getChildMeshes().forEach((m)=>{
        makePickable(m)
    })
}

function summonAwesome(scene: BABYLON.Scene, windowAnchor: BABYLON.Mesh) {
    var fountain = BABYLON.Mesh.CreateBox("fountain", 0.01, scene);
    fountain.visibility = 0.1;
    windowAnchor.addChild(fountain);
    let createNewSystem = function (): BABYLON.ParticleSystem {
        var particleSystem;
        if (BABYLON.GPUParticleSystem.IsSupported) {
            console.log("GPU supported!");
            particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity: 1000 }, scene);
            particleSystem.activeParticleCount = 1000;
        }
        else {
            particleSystem = new BABYLON.ParticleSystem("particles", 10, scene);
        }
        particleSystem.parent = windowAnchor;
        particleSystem.emitRate = 100;
        particleSystem.particleEmitterType = new BABYLON.SphereParticleEmitter(1);
        particleSystem.particleTexture = new BABYLON.Texture("public/awesome.png", scene);
        particleSystem.maxLifeTime = 1;
        particleSystem.minSize = 1;
        particleSystem.maxSize = 10;
        particleSystem.emitter = fountain;
        particleSystem.disposeOnStop = false;
        particleSystem.targetStopDuration = 3;
        particleSystem.minEmitPower = 10;
        particleSystem.maxEmitPower = 20;
        return particleSystem;
    };
    var particleSystem = createNewSystem();
    var awesomeMaterial = new BABYLON.StandardMaterial("amiga", scene);
    awesomeMaterial.diffuseTexture = new BABYLON.Texture("public/awesome2.png", scene);
    awesomeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 10, scene);
    sphere.rotation.y = -Math.PI / 2;
    sphere.material = awesomeMaterial;
    sphere.position = new BABYLON.Vector3(0, 1, 100);
    windowAnchor.addChild(sphere);
    var vel = new BABYLON.Vector3(0, 20, -20);
    scene.onBeforeRenderObservable.add(() => {
        if (sphere.position.y > 0) {
            var delta = scene.getEngine().getDeltaTime() / 1000;
            vel.addInPlace(new BABYLON.Vector3(0, -9.8, 0).scale(delta));
            sphere.position.addInPlace(vel.scale(delta));
            if (sphere.position.y <= 0) {
                sphere.position.y = 0;
                fountain.position.copyFrom(sphere.position);
                particleSystem.targetStopDuration = 3;
                particleSystem.start();
                sphere.dispose();
            }
        }
    });
}


shell.registerApp({
    name: "chatApp", 
    iconUrl: "public/appicons/chatApp.png",
    launch: async (windowAnchor:BABYLON.Mesh, vrHelper: VRExperienceHelper)=>{
        // Get scene
        let scene = windowAnchor.getScene();
        // Load gltf model and add to scene   
        let container = await BABYLON.SceneLoader.LoadAssetContainerAsync("public/ChatApp.glb", "", scene)
        
        let loadedModel = container.createRootMesh();
        let creatPopAnimation = function (targetMesh){
            // pop animation
                var animationBox1 = new BABYLON.Animation("myAnimation", "scaling.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                var animationBox2 = new BABYLON.Animation("myAnimation", "scaling.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
                var animationBox3 = new BABYLON.Animation("myAnimation", "scaling.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            
                var keys = [{
                    frame: 0,
                    value: 1},{
                    frame: 5,
                    value: 1.1},{
                    frame: 15,
                    value: 1}]; 
            
                animationBox1.setKeys(keys);
                animationBox2.setKeys(keys);
                animationBox3.setKeys(keys);

                let popAnimation = new BABYLON.AnimationGroup("popGroup"+targetMesh.name, scene);
                popAnimation.addTargetedAnimation(animationBox1, targetMesh);
                popAnimation.addTargetedAnimation(animationBox2, targetMesh);
                popAnimation.addTargetedAnimation(animationBox3, targetMesh);
                scene.addAnimationGroup(popAnimation);
            }
        

        let hoverEffect = function(target){
            target.actionManager = new BABYLON.ActionManager(scene);

            target.actionManager.registerAction(
                new BABYLON.InterpolateValueAction(
                    {
                        trigger: BABYLON.ActionManager.OnPointerOverTrigger,
                        parameter: target
                    },
                    target,
                    "scaling",
                    new BABYLON.Vector3(1.2, 1.2, 1.2),
                    50
                )
            );
            target.actionManager.registerAction(
                new BABYLON.InterpolateValueAction(
                    {
                        trigger: BABYLON.ActionManager.OnPointerOutTrigger,
                        parameter: target
                    },
                    target,
                    "scaling",
                    new BABYLON.Vector3(1, 1, 1),
                    50
                )
            );
        }

        /**
         * Creates a contact list
         */
        let createContactList = function (){
            var Contacts = ["public/contactPeople2.png", 
            "public/contactPeople1.png", 
            "public/contactPeople4.png", 
            "public/contactPeople3.png"];

            for (var i in Contacts){
                let myPlane = BABYLON.MeshBuilder.CreatePlane("name"+i, {width: 0.8, height: 0.25}, scene);
                //myPlane.dispose();
                myPlane.position.z = 0
                myPlane.position.x = 0
                myPlane.position.y = 0.5 +0.3*(+i);
                myPlane.parent = listMesh;
                let myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
                // myMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);

                myPlane.material = myMaterial;//(+i === Contacts.length-1)? myMaterial:null;

                let texture  = new BABYLON.Texture(Contacts[i], scene);
                texture.hasAlpha = true;
                myMaterial.diffuseTexture = texture;
                myMaterial.emissiveTexture = texture;

                myPlane.visibility = 0;

                hoverEffect(myPlane);

                creatPopAnimation(myPlane);

                createDialogBox(myPlane);

                createVideoChat(myPlane,"public/video"+i+".mov");

                let option1 = BABYLON.MeshBuilder.CreatePlane("listAction1." + myPlane.name, {width: 0.25, height: 0.25}, scene);
                //myPlane.dispose();
                option1.position.z = 0
                option1.position.x = 0.6
                option1.position.y = 0;
                option1.parent = myPlane;
                option1.visibility = 0;
                let guiTexture1 = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(option1)

                let guiPanel1 = new Stage.GUI.StackPanel()  
                guiPanel1.top = "0px"
                guiTexture1.addControl(guiPanel1)
                let chat = Stage.GUI.Button.CreateImageOnlyButton("chat", "public/chatIcon.png");
                chat.fontSize = 300
                chat.color = "white"
                chat.cornerRadius = 500

                chat.onPointerClickObservable.add(()=>{
                    console.log("1");
                })
                guiPanel1.addControl(chat);
                hoverEffect(option1);


                var option2 = BABYLON.MeshBuilder.CreatePlane("listAction1." + myPlane.name, {width: 0.25, height: 0.25}, scene);
                //myPlane.dispose();
                option2.position.z = 0
                option2.position.x = 0.9
                option2.position.y = 0;
                option2.parent = myPlane;
                option2.visibility = 0;
                let guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(option2)

                let guiPanel = new Stage.GUI.StackPanel()  
                guiPanel.top = "0px"
                guiTexture.addControl(guiPanel)
                let video = Stage.GUI.Button.CreateImageOnlyButton("video", "public/videoIcon.png");
                video.fontSize = 300
                video.color = "white"
                video.cornerRadius = 500
                video.onPointerClickObservable.add((evt)=>{
                    stopVideos();
                    scene.getMeshByName("videoBox"+myPlane.name).visibility = 1;
                    let material = scene.getMeshByName("videoBox"+myPlane.name).material as StandardMaterial;
                    let videoTexture = material.diffuseTexture as VideoTexture;
                    videoTexture.video.loop = false;
                    videoTexture.video.onended = function (){
                        scene.getMeshByName("videoBox"+myPlane.name).visibility = 0;
                    } 
                    videoTexture.video.play();
                })
                guiPanel.addControl(video);
                hoverEffect(option2);
            }
        }

        let stopVideos = function () {
            let contactList = ["name0","name1","name2","name3"];

            for (let i in contactList){
                if (scene.getMeshByName("videoBox"+contactList[i]).visibility === 1){
                    let material = scene.getMeshByName("videoBox"+contactList[i]).material as StandardMaterial;
                    let videoTexture = material.diffuseTexture as VideoTexture;
                    videoTexture.video.pause();
                    scene.getMeshByName("videoBox"+contactList[i]).visibility = 0;
                }
            }
        }

        let createDialogBox = function(parentPerson) {
             console.log(parentPerson.id);
            let dialogBox = BABYLON.MeshBuilder.CreatePlane("dialogBox" + parentPerson.id, {width: 2, height: 1.5}, scene);
            dialogBox.position.x = -2;
            dialogBox.position.y = parentPerson.position.y + 2;
            dialogBox.visibility = 0;
            //makeNotPickable(dialogBox);
            dialogBox.parent = windowAnchor;
            let drag = new BABYLON.SixDofDragBehavior()
            // drag.moveAttached = false;
            // drag.onDragObservable.add(function(evt){
            //     dialogBox.position.addInPlace(evt.delta);
            // });
            dialogBox.addBehavior(drag);

            var closePlane = BABYLON.MeshBuilder.CreatePlane("closePlane" + parentPerson.id, {width: 0.2, height: 0.2}, scene)
            closePlane.position.x= 0.9;
            closePlane.position.y= 0.9;
            closePlane.position.z= -0.01;
            closePlane.parent = dialogBox 
            var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(closePlane)

            var guiPanel = new Stage.GUI.StackPanel()  
            guiPanel.top = "0px"
            guiTexture.addControl(guiPanel)
            var close = Stage.GUI.Button.CreateSimpleButton("close", "X");
            close.fontSize = 300
            close.color = "white"
            close.background = "#4AB3F4"
            close.cornerRadius = 200
            close.thickness = 20
            close.onPointerClickObservable.add(()=>{
                scene.getMeshByName("dialogBox" + parentPerson.id).visibility = 0;
                scene.getMeshByName("closePlane" + parentPerson.id).visibility = 0;
                scene.getMeshByName("voicePlane" + parentPerson.id).visibility = 0;
                scene.getMeshByName("inputPlane" + parentPerson.id).visibility = 0;

                
            })
            guiPanel.addControl(close);
            closePlane.visibility = 0;

            var voicePlane = BABYLON.MeshBuilder.CreatePlane("voicePlane" + parentPerson.id, {width: 0.2, height: 0.2}, scene)
            voicePlane.position.x= 0.9;
            voicePlane.position.y= - 0.9;
            voicePlane.position.z= -0.01;
            voicePlane.parent = dialogBox 
            var guiTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(voicePlane)

            var guiPanel2 = new Stage.GUI.StackPanel()  
            guiPanel2.top = "0px"
            guiTexture.addControl(guiPanel2)
            var record = Stage.GUI.Button.CreateImageOnlyButton("record", "public/microphone.gif");          
            record.fontSize = 300
            record.color = "white"
            
            record.cornerRadius = 500
            record.thickness = 20
            record.onPointerClickObservable.add(()=>{
                console.log("start recording");
            })
            guiPanel2.addControl(record);
            voicePlane.visibility = 0;


             let inputPlane = BABYLON.MeshBuilder.CreatePlane("inputPlane" + parentPerson.id, {width: 1.7, height: 1.7}, scene)
            inputPlane.position.x= -0.1;
            inputPlane.position.y= -0.9;
            inputPlane.position.z = -0.01;
            inputPlane.parent = dialogBox;

            record.cornerRadius = 500
            record.thickness = 20
            let inputTexture = Stage.GUI.AdvancedDynamicTexture.CreateForMesh(inputPlane);
            let input = new Stage.GUI.InputText();
                input.height = "130px";             
                input.text = "default";
                input.color = "blue";
                input.fontSize = "120";
                input.background = "white";
                input.autoStretchWidth = false;
                inputTexture.addControl(input);
                        
            
            record.onPointerClickObservable.add(()=>{
                shell.recognizer.StartOneShotRecognition(function(x) {input.text=x; inputTexture.addControl(input)}, function(y) {input.text=y; inputTexture.addControl(input)})
            })
            guiPanel2.addControl(record);
            voicePlane.visibility = 0;
            inputPlane.visibility = 0;
            //     //input.linkWithMesh(inputPlane);   
            //     input.linkOffsetY = 50;
            //     input.linkOffsetX = 400

        }

        let createVideoChat = function(parentPerson, path) {
            console.log(parentPerson.id);
            let videoBox = BABYLON.MeshBuilder.CreatePlane("videoBox" + parentPerson.id, {width: 2.5, height: 1.5}, scene);
            videoBox.position.x = -2;
            videoBox.position.y = parentPerson.position.y + 1;
            videoBox.visibility = 0;
            videoBox.parent = windowAnchor;
            let drag = new BABYLON.SixDofDragBehavior()
            // drag.moveAttached = false;
            // drag.onDragObservable.add(function(evt){
            //     dialogBox.position.addInPlace(evt.delta);
            // });
            videoBox.addBehavior(drag);
            console.log(path);
            var videoTexture = new BABYLON.VideoTexture("video" + parentPerson.id, [path], scene, true);
            var videoMaterial = new BABYLON.StandardMaterial("", scene);
            videoMaterial.emissiveColor = new BABYLON.Color3(1,1,1)
            videoMaterial.diffuseTexture = videoTexture
            videoBox.material = videoMaterial

            videoTexture.video.pause();

        }
        let listMesh = new BABYLON.Mesh("contactList", scene);
        listMesh.parent = loadedModel;
        
        createContactList();
        // createDialogBox();

        let b = new BABYLON.SixDofDragBehavior()
        loadedModel.addBehavior(b)

        loadedModel.position.z = 0
        loadedModel.position.y = 0.5
        loadedModel.position.x = 0
  
        creatPopAnimation(loadedModel);

        scene.addMesh(loadedModel, true)
        // Any mesh created MUST have the windowAnchor as it's parent
        loadedModel.parent = windowAnchor;
        //var chatActions = new ActionManager(scene);

        scene.onPointerObservable.add((evt)=> {

            // console.log(evt.pickInfo.pickedMesh.name);
            if(evt.type==BABYLON.PointerEventTypes.POINTERMOVE && evt.pickInfo.pickedMesh && evt.pickInfo.pickedMesh.id == 'name3'){
                console.log("hover");
            }
            // if the click hits the ground object, we change the impact position

            if (evt.type==BABYLON.PointerEventTypes.POINTERUP && evt.pickInfo.pickedMesh && 
                (evt.pickInfo.pickedMesh.id === "name0" 
                ||evt.pickInfo.pickedMesh.id === "name1" 
                ||evt.pickInfo.pickedMesh.id === "name2" 
                ||evt.pickInfo.pickedMesh.id === "name3" )) {
                console.log("click");
                scene.getAnimationGroupByName("popGroup"+evt.pickInfo.pickedMesh.id).stop();
                if(evt.pickInfo.pickedMesh.id === "name0" ){
                    summonAwesome(scene,windowAnchor);
                }
                scene.getMeshByName("dialogBox" + evt.pickInfo.pickedMesh.id).visibility = 1;
                scene.getMeshByName("closePlane" + evt.pickInfo.pickedMesh.id).visibility = 1;
                scene.getMeshByName("voicePlane" + evt.pickInfo.pickedMesh.id).visibility = 1;
                scene.getMeshByName("inputPlane" + evt.pickInfo.pickedMesh.id).visibility = 1;
            }
            if ( evt.type==BABYLON.PointerEventTypes.POINTERUP && evt.pickInfo.pickedMesh && evt.pickInfo.pickedMesh.id === "node_id32") {
                scene.getAnimationGroupByName("popGroupassetContainerRootMesh").stop();
                let visibility;
                listMesh.getChildMeshes().forEach(element => {
                    element.visibility = element.visibility === 1 ? 0:1;
                    visibility = element.visibility;

                });
                if (visibility === 0){
                    scene.getMeshByName("dialogBoxname0").visibility = 0;
                    scene.getMeshByName("dialogBoxname1").visibility = 0;
                    scene.getMeshByName("dialogBoxname2").visibility = 0;
                    scene.getMeshByName("dialogBoxname3").visibility = 0;
                    scene.getMeshByName("closePlanename0").visibility = 0;
                    scene.getMeshByName("closePlanename1").visibility = 0;
                    scene.getMeshByName("closePlanename2").visibility = 0;
                    scene.getMeshByName("closePlanename3").visibility = 0;
                    scene.getMeshByName("voicePlanename0").visibility = 0;
                    scene.getMeshByName("voicePlanename1").visibility = 0;
                    scene.getMeshByName("voicePlanename2").visibility = 0;
                    scene.getMeshByName("voicePlanename3").visibility = 0;
                    scene.getMeshByName("inputPlanename0").visibility = 0;
                    scene.getMeshByName("inputPlanename1").visibility = 0;
                    scene.getMeshByName("inputPlanename2").visibility = 0;
                    scene.getMeshByName("inputPlanename3").visibility = 0;

                    
                    }

            }
        });
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnKeyUpTrigger,
                    parameter: 'q'
                },
                function () { 
                    scene.getAnimationGroupByName("popGroupname0").play(true);
                    scene.getAnimationGroupByName("popGroupname1").play(true);
                    scene.getAnimationGroupByName("popGroupassetContainerRootMesh").play(true);
                    // var music = new BABYLON.Sound("Violons", "public/servicebell.wav", scene, null, { loop: true, autoplay: true });
                    
                    
                }
            )
        );

    }, 
    dispose: async ()=>{

    }


})