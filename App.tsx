import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { LogBox, Platform, Pressable, StyleSheet, View } from 'react-native';
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from '@tensorflow/tfjs'
import * as Speech from 'expo-speech';
import TextRecognition from '@react-native-ml-kit/text-recognition';


const TensorCamera = cameraWithTensors(Camera);
LogBox.ignoreAllLogs(true);

export default function App() {

  let a=[];

  const [model,setModel] = useState<cocoSsd.ObjectDetection>();

  let textureDims = 
    Platform. OS == 'ios' 
      ? { height : 1920, width : 1080 } 
      : { height : 1200, width : 1600 }; 
      
  function handleCameraStream(images : any) { 
    const loop = async () => { 
      const nextImageTensor = images.next().value;
      if (!model || !nextImageTensor) 
        throw new Error('No model or image tensor'); 
      const result = await TextRecognition.recognize(nextImageTensor);
      console.log('Recognized text:', result.text);
      model 
        .detect(nextImageTensor) 
        .then((prediction) => { 
          display(prediction);
        }) 
        .catch((error) => { 
          console.log(error); 
        }); 
      requestAnimationFrame(loop);
    }; 
    loop();
  }

  function display( 
    predictions : cocoSsd.DetectedObject[]
    ) {
      a=[];
      for(const prediction of predictions){
        if(a.length==0)
        {
          a.push(prediction.class);
        }
        let flag = 1;
        for(let i=0;i<a.length;i++)
        {
          if(a[i]==prediction.class)
          {
            flag = 0;
            break;
          }
        }
        if(flag==1)
        {
          a.push(prediction.class);
          console.log(a);
        }
      }
    } 

  useEffect (() => { 
    (async () => { 
      const { status } = await Camera.requestCameraPermissionsAsync(); 
      await tf.ready(); 
      setModel(await cocoSsd.load()); 
    })(); 
  }, []);

  const speak = () => {
    if(a.length>0){
      if(a.length==1)
      {
        Speech.speak("There is a "+a.toString()+"in front of you");
      }
      else if(a.length==2)
      {
        Speech.speak("There is a "+a[0].toString()+" and "+a[1].toString()+" in front of you");
      }
      else if(a.length>2)
      {
        let b = a.slice(0,a.length-1);
        let temp = a.join(",");
        Speech.speak("There is a "+b.toString()+" and "+a[a.length-1].toString()+" in front of you");
      }
    }
    a=[]
  };

  return ( 
    <View style={styles.container}> 
      <Pressable onPress={speak}>
      <TensorCamera 
        style={styles.camera} 
        cameraTextureHeight={textureDims.height} 
        cameraTextureWidth={textureDims.width} 
        resizeHeight={200} 
        resizeWidth={152} 
        resizeDepth={3} 
        onReady={handleCameraStream} 
        autorender={true} 
        useCustomShadersToResize={false}
      />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera:{
    width: '100%',
    height: '100%',
  }
});

