import React, { useEffect, useState } from 'react';
import Header from './components/Layout/Header';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';

import SendIcon from '@mui/icons-material/Send';
import imageCompression from 'browser-image-compression';
import { Snackbar, Alert, TextField, Stack, Box, Card, IconButton, InputAdornment, OutlinedInput, Skeleton, Grid } from '@mui/material';
import Cookies from 'js-cookie';
import P5jS from './components/Viewer/p5';
import ThreejS from './components/Viewer/Threejs';
import D3Editor from './components/Viewer/D3Editor';
import MermaidEditor from './components/Viewer/Mermaid';
import { SaveDataToDb, WikiDataFromDb } from './api/DbApi/wikiFromDb';
import Mcq from './components/Utils/Mcq';
import { UpdateRemixVersion } from '../pages/api/DbApi/remixApi';




const Home = () => {
  const [activeTab, setActiveTab] = useState('wikipedia');
  const [wikipediaInput, setWikipediaInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFormat, setActiveFormat] = useState('mermaidjs');
  const [simulationActive, setSimulationActive] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [summary, setSummary] = useState('');
  const [textInput, setTextInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
   const [imagePreview, setImagePreview] = useState('');
   const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [concept, setConcept] = useState({ name: '', principles: [] });
  const [interactivityNotes, setInteractivityNotes] = useState('');
  const [learningObjectives, setLearningObjectives] = useState([]);
  const [error, setError] = useState(null);
  const [showProFeatures, setShowProFeatures] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [GetApikey,setGetApikey] = useState(Cookies.get("apiKey"))
  const [p5jsCode,setp5jsCode] = useState("1")
  const [d3jsCode,setD3jsCode] = useState("2")
  const [threejsCode,setThreejsCode] = useState("3")
  const [mermaidjsCode,setMermaidjsCode] = useState("4")
  const [remixVersion, setRemixVersion] = useState('0');


  

  const [mcqData,setMcqData]= useState([])
  const [viewMcq,setViewMcq] = useState(false)
  const[mcqLoading,setMcqLoading] = useState(false)
  const[mcqType,setMcqType] = useState("")

  const [showApiKeyToggle, setShowApiKeyToggle] = useState(true);
  const [usingCompanyKey, setUsingCompanyKey] = useState(false);
  const[noCodeInDatabase,setNoCodeInDatabase] = useState(false)


  // Memory cache object to store data
  const memoryCache = {
    summary: null,
    p5jsCode: null,
    d3jsCode: null,
    threejsCode: null,
    mermaidjsCode: null
  };

  // Temporary Data saved in cookies
  const GetSummary = Cookies.get("Summary")

  // Helper function to check if a key exists in memory cache
  const hasKeyInCache = (key) => {
    return key in memoryCache && memoryCache[key] !== null;
  }

  // Helper function to get value from memory cache
  const getFromCache = (key) => {
    return key in memoryCache ? memoryCache[key] : null;
  }

  // Helper function to set value in memory cache
  const setInCache = (key, value) => {
    memoryCache[key] = value;
  }

  // Helper function to remove a key from memory cache
  const removeFromCache = (key) => {
    if (key in memoryCache) {
      delete memoryCache[key];
    }
    console.log(`Removed ${key} from memory cache`);
  }

  // Check key in cookie 
  const  hasCookie =(name) =>{
    const pattern = new RegExp('(^|; )' + encodeURIComponent(name) + '=');
    return pattern.test(document.cookie);
  }
  

    
   const handleFileChange = async (e) => {

     const file = e.target.files[0];
   
     if (file) {
       // Validate file type
       const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
       if (!validImageTypes.includes(file.type)) {
        showSnackbar('Please select a valid image file (JPEG, PNG, JPG, or WEBP)', 'error');
         return;
       }
   
       // Validate file size (max 10MB)
       if (file.size > 10 * 1024 * 1024) {
        showSnackbar('Image size exceeds 10MB limit. Please select a mdaller image.', 'error');
         return;
       }
   
       // Compression options
       const options = {
         maxSizeMB: 1, // Compress to ~1MB
         maxWidthOrHeight: 1920, // Max width or height
         useWebWorker: true
       };
   
       try {
         // Compress image
         const compressedFile = await imageCompression(file, options);
   
         // Convert compressed file to Base64
         const reader = new FileReader();
         reader.onloadend = () => {
           setImagePreview(reader.result); // Update image preview
          //  showSnackbar('Image uploaded successfully!', 'success');
         };
         reader.readAsDataURL(compressedFile);
   
       } catch (error) {
         console.error('Image compression failed:', error);
         showSnackbar('Error compressing image. Please try again.', 'error');
       }
     }
   };


// Remove the code prefix and leading whitespace/newlines
   const cleanCode = (rawCode) => {
    if (!rawCode) return "";
  
    let cleaned = rawCode;
  
    // Remove outer quotes if it's a JSON string
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      try {
        cleaned = JSON.parse(cleaned);
      } catch (err) {
        cleaned = cleaned.slice(1, -1);
      }
    }
  
    // Remove "code" prefix and leading whitespace/newlines
    cleaned = cleaned.replace(/^code\s*/i, '');
  
    return cleaned;
  };
  


  const RemoveKey = ()=>{
    Cookies.remove("Summary")
    removeFromCache("p5jsCode")
    removeFromCache("d3jsCode")
    removeFromCache("mermaidjsCode")
    removeFromCache("threejsCode")
    setp5jsCode("1")
    setD3jsCode("2")
    setMermaidjsCode("3")
    setThreejsCode("4")
  }


  // Remix Default

  const fetchwikiDatawithai = async()=>{
    
    if (!wikipediaInput) return;
    if((showApiKeyToggle&&!GetApikey)){
      showSnackbar('Please enter a valid API key', 'error');
      return;
   }
   setSimulationActive(false)
   setIsProcessing(true);
   setSummary("");
   setError(null);
 
     try {
      setIsProcessing(true);
      const response = await fetch("/api/wiki", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "wikipedia",
          input: wikipediaInput,
          format: activeFormat,
          apiKeyFormate:GetApikey,
        
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // throw new Error(data.error || "Failed to generate visualization");

        if(data?.error?.includes("401")){
        showSnackbar("Please Give Valid Api Key", 'error');
      }
      else if(data?.error?.includes("400")){
        showSnackbar("Low On Tokens Purchase Your Credits", 'error');

      }
    }
      
    if(data?.success){
      setIsProcessing(false);
    }
      if(hasCookie("Summary")){
        console.log("Not need Summary")
        setSummary(GetSummary)
      }else{
        Cookies.set('Summary', data.summary);
        setSummary(data.summary);
      }
      
      // Set values in cache for all formats
      if(data.codeOutputs?.p5js) {
        setInCache("p5jsCode", data.codeOutputs.p5js || "");
        if(activeFormat === "p5js") {
          setp5jsCode(data.codeOutputs.p5js || "");
        }
      }
      
      if(data.codeOutputs?.d3js) {
        setInCache("d3jsCode", data.codeOutputs.d3js || "");
        if(activeFormat === "d3js") {
          setD3jsCode(data.codeOutputs.d3js || "");
        }
      }
      
      if(data.codeOutputs?.mermaidjs) {
        setInCache("mermaidjsCode", data.codeOutputs.mermaidjs || "");
        if(activeFormat === "mermaidjs") {
          setMermaidjsCode(data.codeOutputs.mermaidjs || "");
        }
      }
      
      if(data.codeOutputs?.threejs) {
        setInCache("threejsCode", data.codeOutputs.threejs || "");
        if(activeFormat === "threejs") {
          setThreejsCode(data.codeOutputs.threejs || "");
        }
      }
      
      setCodeOutput(data.codeOutputs?.[activeFormat] || "");
      setConcept({
        name: data.concept?.name || "",
        principles: data.concept?.principles || [],
      });
      setInteractivityNotes(data.interactivityNotes || "");
      setLearningObjectives(data.learningObjectives || "");
    } catch (error) {
      console.error("Error submitting text:", error);
      // showSnackbar(error.message, 'error');
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  }

// Fetching Data with Wikipedia Link from Database
   const fetchWikiData = async () => {
    setSimulationActive(false)
    if (!wikipediaInput) return;
    let URL = wikipediaInput
    if(!URL.includes("https://en.wikipedia.org/wiki/")){ 
      showSnackbar('Please enter a valid Wikipedia URL', 'error');
      // console.log("Please enter a valid Wikipedia URL")
      return
    } 

    let wikitext = URL.split('https://en.wikipedia.org/wiki/')
    
    try {
      setIsProcessing(true);
    setSummary("");
    setError(null);
      const response = await WikiDataFromDb(wikitext[1].toLowerCase());
      const data = response?.data;
      
    
      if (response.status === 200) {
        const listData = [data];
        listData?.map((i) => {
          {setD3jsCode(i?.d3_code);}
          setp5jsCode(i?.p5_code);
          setMermaidjsCode(i?.mermaid_Code);
          setThreejsCode(i?.three_Code); 
          if(hasCookie("Summary")){
            console.log("Not need Summary")
            setSummary(GetSummary)
          }else{
            Cookies.set('Summary', i.summary);
            setSummary(i.summary);
          } 
        });
        setIsProcessing(false)
      }
      else if(response.status === 404){
       setp5jsCode("")
        setD3jsCode("")
        setMermaidjsCode("")
        setThreejsCode("")
        setIsProcessing(false)
      }
    } 
    catch(err){
      console.error("Error submitting text:", err);
    //  setError(error.details);
    }

  };

  // Fetching Data with Image
  const fetchImageData = async () => {
    setSimulationActive(false)
    setWikipediaInput("")
    
    // Validate we have an image file
    if (!imagePreview) {
      alert('Please select an image first');
      showSnackbar('Please select an image first', 'error');
      return;
    }
    if((showApiKeyToggle&&!GetApikey)){
       showSnackbar('Please enter a valid API key', 'error');
       return;
    }
    setIsProcessing(true);
    setCodeOutput('');
    setSummary("")
    
    try {
      console.log('Submitting image to Claude API');
      
      // Send the base64 image data directly to the API
      const response = await fetch('/api/upload_gpt4v/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: imagePreview,
          formate:activeFormat,
          apiKeyFormate:GetApikey // Base64 string from handleFileChange
        }),
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('API response received:', data);
          
          
          if (data.success) {
            // The backend now parses the JSON and returns the code directly
            if (data.p5jsCode) {
              console.log('Successfully received p5.js code');
              setCodeOutput(data?.p5jsCode)
              setWikipediaInput(data?.wikipedia_link)
              if(hasCookie("Summary")){
               console.log("Not need Summary")
               setSummary(GetSummary)
             }else{
               Cookies.set('Summary', data?.summary);
               setSummary(data?.summary);
             }
              showSnackbar('Image analysis completed successfully!', 'success');  
            } else {
              console.error('No code found in response:', data);
              alert('No code was generated. Please try a different image.');
            }
          } else {
            alert(`Error: ${data.message || 'Failed to process image'}`);
            console.error('API Error:', data.message);
            showSnackbar(data.message || 'Failed to process image', 'error');
          }
        } catch (parseError) {
          console.error('Error parsing JSON from backend:', parseError);
          alert('Error processing the API response. Please try again.');
        }
      } else {
        console.error('API returned error status:', response.status);
        alert(`Server error: ${response.statusText}`);
        showSnackbar(`Server error: ${response.statusText}`, 'error');
      }
    } catch (error) {
      alert('Failed to process image. Please check your connection.');
      console.error('Error calling API:', error);
      showSnackbar('Failed to process image. Please check your connection.', 'error');
    }
    
    setIsProcessing(false);
  };

   
  //  Fetching data Entred Prompt
  const fetchData = async () => {
    setSimulationActive(false)
    if (!textInput) return;
    if((showApiKeyToggle&&!GetApikey)){
     showSnackbar('Please enter a valid API key', 'error');
     return;
  }

    setIsProcessing(true);
    setSummary("");
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "text",
          input: textInput,
          format: activeFormat,
          apiKeyFormate:GetApikey,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate visualization");
      }

      if(hasCookie("Summary")){
       console.log("Not need Summary")
       setSummary(GetSummary)
     }else{
       Cookies.set('Summary', data.summary);
       setSummary(data.summary);
     }
      setCodeOutput(data.codeOutputs?.[activeFormat] || "");
      setConcept({
        name: data.concept?.name || "",
        principles: data.concept?.principles || [],
      });
      setInteractivityNotes(data.interactivityNotes || "");
      setLearningObjectives(data.learningObjectives || "");
    } catch (error) {
      console.error("Error submitting text:", error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };


  // Generate MCQS
  const GeneraMcqs = async()=>{
    setSimulationActive(false)

    if(!summary) return
    if((showApiKeyToggle&&!GetApikey)){
      showSnackbar('Please enter a valid API key', 'error');
      return;
   }
    setMcqLoading(true)
    try{
      let summary = ""
      if(mcqType === "Summary"){
        summary = GetSummary
      }else if(mcqType === "Code"){
        summary = codeOutput
      }else if(mcqType === "Simulator Viewer"){
        summary = `${activeFormat} simulator viewer`
      }
      const response = await fetch("/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary:summary,
          apiKeyFormate:GetApikey
        }),
      });

      const data = await response.json();
      console.log(data?.mcq?.questions)
      if(response.status === 200){
        setMcqData(data?.mcq?.questions)
        setViewMcq(true)
        setMcqLoading(false)
        // router.push("/mcq")
        showSnackbar("MCQ Generated Successfully", "success")
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to generate visualization");
      }
      
    }catch(error){
      console.error("Error submitting text:", error);
      setError(error.message);
    }finally{
      setMcqLoading(false)
    }

  }

 


//  fetch the code when formatechanges 

useEffect(()=>{
    if(activeTab === "Image"){
      fetchImageData()

    }
    else if(activeTab === "text"){
      fetchData()

    }
},[activeFormat])

// Fetching Data with Wikipedia Link
useEffect(() => {
  let codeToShow = "";

  switch (activeFormat) {
    case "p5js":
      codeToShow = cleanCode(p5jsCode);
      console.log(p5jsCode.length,activeFormat)
      {(p5jsCode.length ===0 ) && fetchwikiDatawithai()}
      break;
    case "d3js":
      codeToShow = cleanCode(d3jsCode);
      {(d3jsCode.length ===0)&& fetchwikiDatawithai()}
      console.log(d3jsCode.length,activeFormat)
      break;
    case "mermaidjs":
      codeToShow = cleanCode(mermaidjsCode);
      console.log(mermaidjsCode.length,activeFormat)
      {(mermaidjsCode.length ===0) && fetchwikiDatawithai() }
      break;
    case "threejs":
      codeToShow = cleanCode(threejsCode);
      {(threejsCode.length === 0) && fetchwikiDatawithai()}
      console.log(threejsCode.length,activeFormat)
      break;
    default:
      codeToShow = "// Select a format to see the code.";
  }

  setCodeOutput(codeToShow);
}, [activeFormat, p5jsCode, d3jsCode, mermaidjsCode, threejsCode]);

useEffect(() => {
if(codeOutput.length >1 && activeFormat === "p5js") {
  setSimulationActive(false);
    setInterval(() => {
      setSimulationActive(true);
    }, 2000);
  }
    else if(codeOutput.length > 1 && activeFormat === "threejs") {  
      setSimulationActive(false);
      setInterval(() => {
        setSimulationActive(true);
      }, 1000);
    }
    else if(codeOutput.length > 1 && activeFormat === "d3js"){
      setSimulationActive(false);
      setInterval(() => {
        setSimulationActive(true);
      }, 1000);
    }
    else if(codeOutput.length > 1 && activeFormat === "mermaidjs"){
      setSimulationActive(false);
      setInterval(() => {
        setSimulationActive(true);
      }, 1000);
    }

  
  else {
    setSimulationActive(false);
  }
}, [codeOutput]);

useEffect(()=>{
  if(mcqType !== ""){
    GeneraMcqs()
  }

},[mcqType])





//  console.log(getFromCache("d3jsCode"))
const SavedataonDatabase = async()=>{
  if(!wikipediaInput) return

    showSnackbar("Saving...", "info")
  try{
    const remixData = {};
    if (remixVersion === "1") {
      remixData.remix1 = {
        mermaid_code: mermaidjsCode,
        p5_code: p5jsCode,
        three_code: threejsCode,
        d3_code: d3jsCode,
        summary: GetSummary
      };
    } else if (remixVersion === "2") {
      remixData.remix2 = {
        mermaid_code: mermaidjsCode,
        p5_code: p5jsCode,
        three_code: threejsCode,
        d3_code: d3jsCode,
        summary: GetSummary
      };
    } else if (remixVersion === "3") {
      remixData.remix3 = {
        mermaid_code: mermaidjsCode,
        p5_code: p5jsCode,
        three_code: threejsCode,
        d3_code: d3jsCode,
        summary: GetSummary
      };
    }

    const response = await SaveDataToDb(
      wikipediaInput, 
      GetSummary, 
      mcqData,
      mermaidjsCode,
      p5jsCode,
      threejsCode,
      d3jsCode,
      remixData.remix1,
      remixData.remix2,
      remixData.remix3
    );
    
    if (response.status === 201){
      showSnackbar("Data Saved Successfully")
      console.log(response.data)
    } else {
      showSnackbar("Failed to save data: " + (response.data?.message || "Unknown error"), "error")
    }

  }catch(error){
    console.error(error)
    showSnackbar("Error saving data: " + (error.message || "Unknown error"), "error")
  }
  }

  const saveRemixVersion = async(version) => {
    if (!wikipediaInput) {
      showSnackbar('Please enter a Wikipedia URL first', 'error');
      return;
    }

    const wikiText = wikipediaInput.split('https://en.wikipedia.org/wiki/')[1];
    const remixData = {
      mermaid_code: mermaidjsCode,
      p5_code: p5jsCode,
      three_code: threejsCode,
      d3_code: d3jsCode,
      summary: GetSummary
    };
    showSnackbar(`Saving Remix ${version}...`, 'info');
    try {
      const response = await UpdateRemixVersion(wikiText, `remix${version}`, remixData);
    if (response.status === 200) {
      showSnackbar(`Remix ${version} saved successfully!`);
    } else {
      showSnackbar(`Failed to save Remix ${version}: ${response.data?.message || 'Unknown error'}`, 'error');
    }
  } catch(error) {
    console.error(error);
    showSnackbar(`Error saving Remix ${version}: ${error.message || 'Unknown error'}`, 'error');
  }
};
   
   const addConsoleOutput = (message, isError = false) => {
     const timestamp = new Date().toLocaleTimeString();
     const formattedMessage = `[${timestamp}] ${isError ? '🔴 ' : ''}${message}`;
     setConsoleOutput(prev => `${prev ? prev + '\n' : ''}${formattedMessage}`);
   };
   

   const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      showSnackbar('Please enter a valid API key', 'error');
      return;
    }
    Cookies.set('apiKey', apiKey);
    setApiKeySaved(true);
    // setShowApiKeyToggle(false);
    showSnackbar('API Key saved successfully!');
    setApiKey(''); 
    setGetApikey(apiKey)

  };

  const handleUseCompanyKey = () => {
    Cookies.remove('apiKey');
    setApiKey('');
    setApiKeySaved(false);
    setUsingCompanyKey(true)
    setShowApiKeyToggle(false);
    setGetApikey(process.env.ANTHROPIC_API_KEY)
    console.log(GetApikey)
    console.log(process.env.ANTHROPIC_API_KEY)
    showSnackbar('Using MicroSim AI Model', 'info');
  };
 
   const FormatButton = ({ id, label, icon, isActive }) => (
     <button
       onClick={() => (setActiveFormat(id),setRemixVersion("0"))}
       className={`flex items-center gap-1 px-3 py-2 rounded-lg text-md transition-colors ${
         isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
       }`}
     >
       <span>{icon}</span>
       <span>{label}</span>
     </button>
   );


  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    setApiKeySaved(false);
  };
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };


// Remix

  const fetchwikiDatawithaiRemix = async()=>{

      console.log(remixVersion)
    
    if (!codeOutput){
      showSnackbar("Please Generate Code First", 'error');
      return;
    }
    if((showApiKeyToggle&&!GetApikey)){
      
      setRemixVersion("0")
      showSnackbar('Please enter a valid API key', 'error');
      setIsProcessing(false)
      return;
   }
   setSimulationActive(false)
   setIsProcessing(true);
   setSummary("");
   setError(null);
 
     try {
      setIsProcessing(true);
      let input = ""
      if(wikipediaInput) input = wikipediaInput
      else if(textInput) input = textInput
      const response = await fetch("/api/remix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: activeFormat,
          input: input,
          format: activeFormat,
          apiKeyFormate:GetApikey,
          existingCode:codeOutput,
          remixVersion:remixVersion
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // throw new Error(data.error || "Failed to generate visualization");
        
        if(data?.error?.includes("401")){
        showSnackbar("Please Give Valid Api Key", 'error');
      }
      else if(data?.error?.includes("400")){
        showSnackbar("Low On Tokens Purchase Your Credits", 'error');

      }
    }
      
    if(data?.success){
      setIsProcessing(false);
    }
      if(hasCookie("Summary")){
        console.log("Not need Summary")
        setSummary(GetSummary)
      }else{
        Cookies.set('Summary', data.summary);
        setSummary(data.summary);
      }
      
      // Set values in cache for all formats
      if(data.codeOutputs?.p5js) {
        setInCache("p5jsCode", data.codeOutputs.p5js || "");
        if(activeFormat === "p5js") {
          setp5jsCode(data.codeOutputs.p5js || "");
        }
      }
      
      if(data.codeOutputs?.d3js) {
        setInCache("d3jsCode", data.codeOutputs.d3js || "");
        if(activeFormat === "d3js") {
          setD3jsCode(data.codeOutputs.d3js || "");
        }
      }
      
      if(data.codeOutputs?.mermaidjs) {
        setInCache("mermaidjsCode", data.codeOutputs.mermaidjs || "");
        if(activeFormat === "mermaidjs") {
          setMermaidjsCode(data.codeOutputs.mermaidjs || "");
        }
      }
      
      if(data.codeOutputs?.threejs) {
        setInCache("threejsCode", data.codeOutputs.threejs || "");
        if(activeFormat === "threejs") {
          setThreejsCode(data.codeOutputs.threejs || "");
        }
      }
      
      setCodeOutput(data.codeOutputs?.[activeFormat] || "");
      setConcept({
        name: data.concept?.name || "",
        principles: data.concept?.principles || [],
      });
      setInteractivityNotes(data.interactivityNotes || "");
      setLearningObjectives(data.learningObjectives || "");
    } catch (error) {
      console.error("Error submitting text:", error);
      // showSnackbar(error.message, 'error');
      setError(error.message);
    } finally {
      setIsProcessing(false);
      setRemixVersion("0")
    }
  }
  
useEffect(()=>{
if(remixVersion !== "0"){
  fetchwikiDatawithaiRemix()
}
},[remixVersion])





  return (
    <div className='bg-white'>
    <main className="max-w-10xl mx-auto px-4 md:px-6 py-2">
         <Header />
    <div className="mb-6 ">
    <div className="space-y-6 ">
    <div className="bg-white  p-6 shadow-md  ">
    <>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><span>🔗</span> Wikipedia Link</h3>
      <div    className="flex flex-col md:flex-row justify-between gap-4 md:items-center w-full">
      {/* Input Group */}
      <form onSubmit={(e) => {
  e.preventDefault();
  fetchWikiData(); // Call the function when submitting the form
  RemoveKey()
}} className="space-y-4">
  <div className="flex gap-2">
  <input
  type="text"
  value={wikipediaInput}
  onChange={(e) => setWikipediaInput(e.target.value)}
  placeholder="Enter Wikipedia URL"
  className="w-full border-3 border-gray-400 rounded-lg px-4 py-2 md:min-w-[400px] lg:min-w-[480px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
  disabled={isProcessing}
  style={{ 
    backgroundColor: '#ffffff', 
    color: '#202124',
    borderColor: '#9ca3af' // Explicit gray-400 color
  }}
/>
    <button
      type="submit"
      className={`bg-[#1a73e8] text-white px-4 py-2 rounded-lg hover:bg-[#1b66c9] focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm hover:shadow-md transition-shadow ${
        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={isProcessing}
      aria-label="Search Wikipedia"
    >
      <span>🔍</span>
    </button>
  </div>
</form>

      <div className=" w-full md:w-auto flex gap-2   overflow-x-auto  pb-2 md:pb-0 lg:pl-16">
          <FormatButton  
            id="mermaidjs" 
            label="Mermaid" 
            icon="🔀" 
            isActive={activeFormat === 'mermaidjs'} 
          />
          
          <FormatButton  
            id="p5js" 
            label="p5.js" 
            icon="🎨" 
            isActive={activeFormat === 'p5js'}
             
          />
          <FormatButton  
            id="threejs" 
            label="Three.js" 
            icon="🧊" 
            isActive={activeFormat === 'threejs'} 
          />
          <FormatButton  
            id="d3js" 
            label="D3.js" 
            icon="📊" 
            isActive={activeFormat === 'd3js'} 
          />
        </div>
      </div>
    </>
  
</div>
</div>
    </div>


{/* Code Editor and Viewer */}
<Grid container spacing={2}>

<Grid size={{xs:12, md:6}} height={{md:800, xs:500}}>
    {/* Code Editor */}
    <div className="bg-white w-full p-6 shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>👨‍💻</span> Code Editor
        </h3>
        <button 
      className={`p-2 rounded-lg ${simulationActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
      onClick={() => setSimulationActive(!simulationActive)}
    >
      {simulationActive ? '⏹️' : '▶️'}
    </button>
      </div>
      <div className="bg-gray-900 text-gray-300  rounded-lg font-mono text-md flex-1 flex overflow-auto ">
        { isProcessing ? (
           <div className="flex flex-col items-center bg-black justify-center h-full w-full">
           <img 
               src="/Spinning Arrow.gif" 
               alt="MicroSim Processing" 
               className="max-w-full max-h-full object-contain"
           />
           
       </div>
        ) : (codeOutput.length > 1) ? (
          <pre className='p-4'>{codeOutput}</pre>
        ) : (
          <img 
            src="/Code - MicroSim Learning Default Image.png" 
            alt="MicroSim Default" 
            className="w-full h-full object-contain bg-black"
          />
        )}
      </div>
    </div>
</Grid>

    <Grid size = {{xs:12,md:6}} height={{md:800,xs:500}}>
    {/* Simulation Viewer */}
    <div className="bg-white h-full w-full p-6 shadow-md  flex flex-col ">
      <div className="mb-4 ">
        <h3 className="text-lg font-semibold flex items-center gap-2  ">
          <span>📊</span> Simulation Viewer
        </h3> 
      </div>
      <div className="bg-gray-900 text-gray-300  rounded-lg font-mono text-md flex-1 flex overflow-auto ">
                {isProcessing ? (
                    <img 
                        src="/Simulation - MicroSim Learning Default Image.png" 
                        alt="Simulation Loading" 
                        className="w-full h-full object-contain bg-black"
                    />
                ) : simulationActive ? (
          <div className="w-full h-full bg-black p-4 text-white">
             {activeFormat === "p5js" && <P5jS running={true} result={codeOutput}/>}
            {activeFormat === "threejs" && <ThreejS running={true} result={codeOutput}/>}
            {activeFormat === "d3js" && <D3Editor running={true} result={codeOutput}/>}
            {activeFormat === "mermaidjs" && <MermaidEditor running={true} result={codeOutput}/>} 
          </div>
        ) :(
        <Stack sx={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",height:"100%",width:"100%",textAlign:"center"}}>
          <Stack>
          <span className="text-4xl">▶️</span>
          <p className="mt-2 text-gray-500">Generate content to see simulation</p>
          </Stack>
        </Stack>)}
      </div>
    </div>
    </Grid>

</Grid>

{/* Remix Prompt */}
<Card elevation={2} sx={{ p: 2, my: 2 }}>
      <div className="flex flex-wrap gap-4 items-center">
        {/* <button 
          className={`p-2 rounded-lg ${remixVersion === "1" ? 'bg-violet-600 text-white hover:bg-violet-700 transition-colors' : 'bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors'}`}
          onClick={() => {setRemixVersion('1');
            saveRemixVersion('1');
        }}
          disabled={isProcessing}
        >
          Remix Prompt 1
        </button>
         
        <button 
          className={`p-2 rounded-lg ${remixVersion === "2" ? 'bg-blue-600 text-white hover:bg-blue-700 transition-colors' : 'bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors'}`}
          onClick={() => {setRemixVersion('2');
            saveRemixVersion('2');
        }}
          disabled={isProcessing}
        >
          Remix Prompt 2
        </button> 
        <button 
          className={`p-2 rounded-lg ${remixVersion === "3" ? 'bg-green-600 text-white hover:bg-green-700 transition-colors' : 'bg-green-100 text-green-600 hover:bg-green-200 transition-colors'}`}
          onClick={() => {setRemixVersion('3');
            saveRemixVersion('3');
        }}
          disabled={isProcessing}
        >
          Remix Prompt 3
        </button> */}
      </div>
    </Card>


{/* API KEY ADDED */}
<Card elevation={2} sx={{my:2,display:"flex",p:2,gap:2,flexDirection:{md:"row",xs:"column"}}}>

<div className="w-full  flex flex-col md:flex-row gap-4 items-center">
{/* <form onSubmit={handleApiKeySubmit} className="relative w-full  md:flex-1 bg-gray-200  ">
              <OutlinedInput 
                type="password" 
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Type in your API Key" 
                className=" px-3 border-0px border-gray-200 h-12 rounded-lg"
                sx={{width:"100%"}}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      type='submit'
                      edge="end"
                      disabled={!apiKey}
                    >
                      
                <SendIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </form>  */}

{/* {!showApiKeyToggle ? (
  <>
    {usingCompanyKey && (
  <div className="text-base text-gray-600 flex flex-wrap items-center">
    <span className="mr-1">Above code is generated by our MicroSim AI model?</span>
    <span 
      className="text-blue-600 font-medium cursor-pointer hover:underline whitespace-nowrap"
      onClick={() => (setShowApiKeyToggle(true),RemoveKey())}
    >
      Instead try using my own API key
    </span>
  </div>
)}
  </>
) : (
  <>
    <form onSubmit={handleApiKeySubmit} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Type your API key here"
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!apiKey}
          className={`absolute right-2 p-2 rounded-full ${apiKey ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400'}`}
        >
          <SendIcon />
        </button>
      </div>
    </form>
    <div onClick={handleUseCompanyKey} className="text-sm text-gray-600  mt-3 cursor-pointer text-center">
  Don't have an API key? <span className="text-blue-600 hover:underline font-medium">Use our MicroSim AI model</span>
</div>
  </>
)} */}

 <button 
          className={`p-2 rounded-lg ${remixVersion === "1" ? 'bg-violet-600 text-white hover:bg-violet-700 transition-colors' : 'bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors'}`}
          onClick={() => {setRemixVersion('1');
            saveRemixVersion('1');
        }}
          disabled={isProcessing}
        >
          Remix Prompt 1
        </button>
         
        <button 
          className={`p-2 rounded-lg ${remixVersion === "2" ? 'bg-blue-600 text-white hover:bg-blue-700 transition-colors' : 'bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors'}`}
          onClick={() => {setRemixVersion('2');
            saveRemixVersion('2');
        }}
          disabled={isProcessing}
        >
          Remix Prompt 2
        </button> 
        <button 
          className={`p-2 rounded-lg ${remixVersion === "3" ? 'bg-green-600 text-white hover:bg-green-700 transition-colors' : 'bg-green-100 text-green-600 hover:bg-green-200 transition-colors'}`}
          onClick={() => {setRemixVersion('3');
            saveRemixVersion('3');
        }}
          disabled={isProcessing}
        >
          Remix Prompt 3
        </button>
</div>

<div className="w-full flex justify-end flex-col md:flex-row gap-6 items-center ">
  {/* {(!usingCompanyKey || showApiKeyToggle) && (
    <select 
      onChange={(e) => setTextInput(e.target.value)} 
      className="w-full md:w-60 px-4 py-3 border-2 border-black rounded-lg bg-white" 
      value={textInput}
      disabled={isProcessing}
    >
      <option value="Claude-instant">Claude</option>
    </select>
  )} */}


  <select 
    onChange={(e) => setTextInput(e.target.value)} 
    className="w-full md:w-48 px-4 py-3 border-2 border-black rounded-lg bg-white" 
    value={textInput}
    disabled={isProcessing}
  >
    <option value="">Example</option>
    <option value="Conway's Game of Life">Conway's Game of Life</option>
    <option value="2D flocking animation">2D Flocking Animation</option>
    <option value="3D forms panning">3D Forms Panning</option>
    <option value="Wave propagation">Wave Propagation</option>
  </select>

  <div className="flex gap-4 ml-auto sm:ml-0">
    <button 
      type="button" 
      onClick={SavedataonDatabase} 
      className="p-2 rounded-lg bg-blue-100 text-blue-600"
    >
      💾
    </button>
  </div>
</div>
</Card>

{/* Prompt */}
<Card elevation={2} sx={{p:2,mb:2}}>
  <Box>
    <form  onSubmit={(e) => {
        e.preventDefault();
        setActiveTab("text")
        fetchData();
        RemoveKey()
      }}>
    <TextField value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Describe what you want to visualize..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3  resize-none"
          disabled={isProcessing}
          multiline
          aria-label="Description input for visualization"  
     />
     <Box display={"flex"} justifyContent={"space-between"}>
        <Box display={"flex"} gap={1} mt={1}>
          <IconButton disabled={isProcessing} onClick={() => {setShowImageUpload(true)}}>
          <ControlPointIcon sx={{ fontSize: 28,color:"black" }} />
          </IconButton>

          <IconButton disabled={isProcessing} >
          <CameraAltOutlinedIcon sx={{ fontSize: 28,color:"black" }} />
          </IconButton>
          </Box>

          <IconButton disabled={isProcessing} type='submit'>
          <ArrowCircleUpIcon sx={{ fontSize: 28,color:"black" }} />
          </IconButton>

     </Box>
     </form>
  </Box>
</Card>


{/* Image Modal */}
{showImageUpload && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🖼️</span> Image Upload
        </h3>
        <button 
          onClick={() => setShowImageUpload(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        fetchImageData();
        setShowImageUpload(false);
        setActiveTab("Image")
        RemoveKey()
      }} className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 mx-auto rounded"
              />
              <button
                type="button"
                onClick={() => setImagePreview('')}
                className="text-red-500 hover:text-red-700"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-4xl">📤</span>
              <p className="text-gray-500">
                Drag and drop an image here, or click to select
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300"
              >
                Select File
              </label>
            </div>
          )}
        </div>
        
        {imagePreview && (
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze Image'}
          </button>
        )}
      </form>
    </div>
  </div>
)}

 {/* Summary */}
 <Card elevation={2} sx={{p:2,mb:2}}>
              <div className="flex  flex-row justify-between items-center gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 w-full md:w-auto">
                  <span>📋</span> Summary
                </h3>

                {/* <span className="text-md">Console log</span> */}
                {summary && (
      <button 
        onClick={() => setShowProFeatures(!showProFeatures)}
        className={`px-3 py-1 rounded-lg text-md ${
          showProFeatures 
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
            : 'bg-green-100 text-green-600 hover:bg-green-200'
        } transition-colors flex items-center gap-1`}
      >
        {showProFeatures ? "Hide MCQs " : "Generate MCQs"}
      </button>
    )}
 
 </div>
<div className="bg-gray-100 mt-3 p-4 rounded-lg">
  {isProcessing ? (
    <div className="animate-pulse space-y-2">
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                ) : (
                  <>
                  <p className="text-gray-700">{summary || "Summary will appear here"}</p>
                  {(showProFeatures && !mcqLoading) && (
                    <div className="mt-3 flex justify-end items-center gap-2">
            <button
              className={`px-3 py-1 rounded-lg text-md  bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors`}
              style={{display:!summary ? "none" : "block"}}
              disabled={!summary || mcqLoading}
                onClick={()=>setMcqType("Summary")}
            >
              {"Generate MCQ Based On Summary"}
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-md  bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors`}
              style={{display:!summary ? "none" : "block"}}
              disabled={!summary || mcqLoading}
                onClick={()=>setMcqType("Code")}
            >
              {mcqLoading ? "Generating..." : "Generate MCQ Based On Code"}
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-md  bg-green-100 text-green-600 hover:bg-green-200 transition-colors`}
              style={{display:!summary ? "none" : "block"}}
              disabled={!summary || mcqLoading}
              onClick={()=>setMcqType("Simulator Viewer")}
            >
              {mcqLoading ? "Generating..." : "Generate MCQ Based On Simulator Viewer"}
            </button>
          </div>
                  )}
                  {mcqLoading && (
                    <div className="mt-3 flex justify-end items-center gap-2">
                      <button className="bg-pink-200 text-pink-600 px-3 py-1 rounded-lg text-md" disabled>Generating...</button>
                    </div>
                  )}
                  </>
                )}
              </div>
  </Card>

{/* Mcq */}
{viewMcq && !isProcessing && (
  mcqLoading ? (
    <div className="flex justify-center items-center h-full">
      <Skeleton variant='rectangular' height={100} width={"100%"} />
    </div>
  ) : (
    <Mcq 
      mcqOptions={mcqData} 
      mcqType={mcqType}
      wikiText={wikipediaInput.split('https://en.wikipedia.org/wiki/')[1]}
    />
  )
)}

            
            <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
>
  <Alert 
    onClose={() => setSnackbarOpen(false)} 
    severity={snackbarSeverity}
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
            </Snackbar>
   </main>  
   </div>   
  );
};

export default Home;