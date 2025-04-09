import React, { useEffect, useState } from 'react';
import Header from './components/Layout/Header';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import SendIcon from '@mui/icons-material/Send';
import imageCompression from 'browser-image-compression';
import { Snackbar, Alert, TextField, Stack, Box, Card, IconButton, InputAdornment, OutlinedInput, Skeleton, Grid } from '@mui/material';
import Cookies from 'js-cookie';
import P5jS from './components/Viewer/p5';
import ThreejS from './components/Viewer/Threejs';
import D3Editor from './components/Viewer/D3Editor';
import MermaidEditor from './components/Viewer/Mermaid';
import { SaveDataToDb, WikiDataFromDb } from './api/DbApi/wikiFromDb';
import { useRouter } from 'next/router';
import Mcq from './components/Utils/Mcq';




const Home = () => {
  const [activeTab, setActiveTab] = useState('wikipedia');
  const [wikipediaInput, setWikipediaInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFormat, setActiveFormat] = useState('p5js');
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
  const GetApikey = Cookies.get("apiKey")
  const [p5jsCode,setp5jsCode] = useState("")
  const [d3jsCode,setD3jsCode] = useState("")
  const [threejsCode,setThreejsCode] = useState("")
  const [mermaidjsCode,setMermaidjsCode] = useState("")

  const [mcqData,setMcqData]= useState([])
  const [viewMcq,setViewMcq] = useState(false)
  const[mcqLoading,setMcqLoading] = useState(false)
  const router = useRouter();

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
  }

  // Check key in cookie 
  const  hasCookie =(name) =>{
    const pattern = new RegExp('(^|; )' + encodeURIComponent(name) + '=');
    return pattern.test(document.cookie);
  }
  
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
  
  
// Fetching Data with Wikipedia Link
  useEffect(() => {
    let codeToShow = "";
  
    switch (activeFormat) {
      case "p5js":
        codeToShow = cleanCode(p5jsCode);
        console.log(p5jsCode.length)
        {p5jsCode.length ===0 && fetchwikiDatawithai()}
        break;
      case "d3js":
        codeToShow = cleanCode(d3jsCode);
        {d3jsCode.length ===0 && fetchwikiDatawithai()}
        break;
      case "mermaidjs":
        codeToShow = cleanCode(mermaidjsCode);
        {mermaidjsCode.length ===0 && fetchwikiDatawithai()}
        break;
      case "threejs":
        codeToShow = cleanCode(threejsCode);
        {threejsCode.length === 0 && fetchwikiDatawithai()}
        break;
      default:
        codeToShow = "// Select a format to see the code.";
    }
  
    setCodeOutput(codeToShow);
  }, [activeFormat, p5jsCode, d3jsCode, mermaidjsCode, threejsCode]);
  

  const RemoveKey = ()=>{
    Cookies.remove("Summary")
    removeFromCache("p5jsCode")
    removeFromCache("d3jsCode")
    removeFromCache("mermaidjsCode")
    removeFromCache("threejsCode")
  }

  const fetchwikiDatawithai = async()=>{
    setSimulationActive(false)
    if (!wikipediaInput) return;

    setIsProcessing(true);
    setSummary("");
    setError(null);


     try {
      const response = await fetch("/api/wiki", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "wikipedia",
          input: wikipediaInput,
          format: activeFormat,
          apiKeyFormate:GetApikey
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
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  }

// Fetching Data with Wikipedia Link from Database
   const fetchWikiData = async () => {
    setSimulationActive(false)
    if (!wikipediaInput) return;

    setIsProcessing(true);
    setSummary("");
    setError(null);

    let URL = wikipediaInput
    let wikitext = URL.split('https://en.wikipedia.org/wiki/')
    
    try {
      const response = await WikiDataFromDb(wikitext[1]);
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
        fetchwikiDatawithai()
        setIsProcessing(true)
      }
    } 
    catch(err){
      console.error("Error submitting text:", err);
    //  setError(error.details);
    }

  };


  // Generate MCQS
  const GeneraMcqs = async()=>{
    setSimulationActive(false)
    setWikipediaInput("")
    if(!summary) return
    setMcqLoading(true)
    try{
      const response = await fetch("/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary:GetSummary,
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
 
  //  Fetching data Entred Prompt
   const fetchData = async () => {
     setSimulationActive(false)
     if (!textInput) return;
 
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
           apiKeyFormate:GetApikey
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
 
 
  //Stop the play Button While changing  the formates 
 useEffect(()=>{
  setSimulationActive(false)
 },[activeFormat])

//  fetch the code when formatechanges 

useEffect(()=>{
    if(activeTab === "Image"){
      fetchImageData()
    }
    else if(activeTab === "text"){
      fetchData()
    }
},[activeFormat])



// useEffect(()=>{
//   Cookies.set("Summary","Summary is not found")
//   setInCache("p5jsCode","p5jsCode is not found")
//   setInCache("d3jsCode","d3jsCode is not found")
//   setInCache("mermaidjsCode","mermaidjsCode is not found")
//   setInCache("threejsCode","threejsCode is not found")
// },[])


//  console.log(getFromCache("d3jsCode"))
const SavedataonDatabase = async()=>{
  if(!wikipediaInput) return
  
  // Check and set p5jsCode
  // if(hasKeyInCache("p5jsCode")){
  //   setp5jsCode(getFromCache("p5jsCode"))
  // } else {
  //   setInCache("p5jsCode", "p5jsCode is not found")
  //   setp5jsCode("p5jsCode is not found")
  // }
  
  // Check and set d3jsCode
  // if(hasKeyInCache("d3jsCode")){
  //   setD3jsCode(getFromCache("d3jsCode"))
  // } else {
  //   setInCache("d3jsCode", "d3jsCode is not found")
  //   setD3jsCode("d3jsCode is not found")
  // }
  
  // Check and set mermaidjsCode
  // if(hasKeyInCache("mermaidjsCode")){
  //   setMermaidjsCode(getFromCache("mermaidjsCode"))
  // } else {
  //   setInCache("mermaidjsCode", "mermaidjsCode is not found")
  //   setMermaidjsCode("mermaidjsCode is not found")
  // }
  
  // Check and set threejsCode
  // if(hasKeyInCache("threejsCode")){
  //   setThreejsCode(getFromCache("threejsCode"))
  // } else {
  //   setInCache("threejsCode", "threejsCode is not found")
  //   setThreejsCode("threejsCode is not found")
  // }

  try{
    const response = await SaveDataToDb(
      wikipediaInput, 
      GetSummary, 
      mcqData,
      mermaidjsCode,
      p5jsCode,
      threejsCode,
      d3jsCode


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
   
   const addConsoleOutput = (message, isError = false) => {
     const timestamp = new Date().toLocaleTimeString();
     const formattedMessage = `[${timestamp}] ${isError ? '🔴 ' : ''}${message}`;
     setConsoleOutput(prev => `${prev ? prev + '\n' : ''}${formattedMessage}`);
   };
   

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    Cookies.set('apiKey', apiKey);
    setApiKey("")
    showSnackbar('API Key saved successfully!');
  };
 
   const FormatButton = ({ id, label, icon, isActive }) => (
     <button
       onClick={() => setActiveFormat(id)}
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
                        
                        className="w-full border rounded-lg px-4 py-2 md:min-w-[400px] lg:min-w-[480px]"
                        disabled={isProcessing}
                      />
                      <button
                        type="submit"
                        className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isProcessing}
                      >
                        <span>🔍</span>
                      </button>
                    </div>
                  </form>

      <div className=" w-full md:w-auto flex gap-2   overflow-x-auto  pb-2 md:pb-0 lg:pl-16">
        
          <FormatButton  
            id="p5js" 
            label="p5.js" 
            icon="🎨" 
            isActive={activeFormat === 'p5js'}
             
          />
          <FormatButton  
            id="mermaidjs" 
            label="Mermaid" 
            icon="🔀" 
            isActive={activeFormat === 'mermaidjs'} 
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

<Grid size = {{xs:12,md:6}} height={{md:800,xs:500}}>
    {/* Code Editor */}
    <div className="bg-white w-full p-6 shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>👨‍💻</span> Code Editor
        </h3>
      </div>
      <div className="bg-gray-900 text-gray-300  p-4 rounded-lg font-mono text-md flex-1 flex overflow-auto ">
        {isProcessing ? (
          <Stack display={"flex"} spacing={1}>
            <Skeleton variant='rectangular' height={10} width={250} sx={{bgcolor:"grey"}} />
            <Skeleton variant='rectangular' height={10} width={200} sx={{bgcolor:"grey"}} />
            <Skeleton variant='rectangular' height={10} width={220} sx={{bgcolor:"grey"}} />
            <Skeleton variant='rectangular' height={10} width={100} sx={{bgcolor:"grey"}} />
            <Skeleton variant='rectangular' height={10} width={150} sx={{bgcolor:"grey"}} />
          </Stack>
        ) : (
          <pre>{codeOutput || "// No code generated yet"}</pre>
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
      <div className="bg-gray-900  text-gray-300 p-4 rounded-lg font-mono text-md flex-1 flex overflow-auto">
        {simulationActive ? (
          <div className="w-full h-full bg-black text-white">
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


{/* API KEY ADDED */}
<Card elevation={2} sx={{my:2,display:"flex",p:2,gap:2,flexDirection:{md:"row",xs:"column"}}}>

<div className="w-full  flex flex-col md:flex-row gap-4 items-center">
<form onSubmit={handleApiKeySubmit} className="relative w-full  md:flex-1 bg-gray-200  ">
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
            </form>
</div>
<div>
 <select onChange={(e) => setTextInput(e.target.value)} className="w-full md:w-60 px-4 py-3 border-2 border-black rounded-lg bg-white " value={textInput}
 disabled={isProcessing} >
       <option value="Claude-instant">Claude</option>
</select>
</div>
<div className="w-full  flex flex-col md:flex-row gap-4 items-center">
<select onChange={(e) => setTextInput(e.target.value)} className="w-full md:w-48 px-4 py-3 border-2 border-black rounded-lg bg-white " value={textInput}
 disabled={isProcessing}  >
                      <option value="">Example</option>
                      <option value="Conway's Game of Life">Conway's Game of Life</option>
                      <option value="2D flocking animation">2D Flocking Animation</option>
                      <option value="3D forms panning">3D Forms Panning</option>
                      <option value="Wave propagation">Wave Propagation</option>
                    </select>
    <div className='flex-1'></div>
    <div className="flex gap-4 ml-auto">
     <button 
                    className={`p-2 rounded-lg ${simulationActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                    onClick={() => setSimulationActive(!simulationActive)}
                  >
                    {simulationActive ? '⏹️' : '▶️'}
                  </button>
                  <button type='button' onClick={SavedataonDatabase} className="p-2 rounded-lg bg-blue-100 text-blue-600">
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
                <IconButton 
        onClick={() => setShowProFeatures(!showProFeatures)}
        className="flex items-center gap-1"
        disabled={!summary}
      >
        <ExpandCircleDownOutlinedIcon 
          sx={{ 
            fontSize: 20,
            transform: showProFeatures ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            color:"black"
          }} 
          aria-label="Toggle pro features" 
        />
                </IconButton>
 
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
                  {showProFeatures && (
                    <div className="mt-3 flex justify-end">
            <button
              className={`px-3 py-1 rounded-lg text-md  bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors`}
              style={{display:!summary ? "none" : "block"}}
              disabled={!summary || mcqLoading}
              onClick={GeneraMcqs}
            >
              {mcqLoading ? "Generating..." : "Generate MCQ"}
            </button>
          </div>
                  )}
                  </>
                )}
              </div>
  </Card>

{/* Mcq */}
{viewMcq && !isProcessing &&< >



  {mcqLoading ? (<div className="flex justify-center items-center h-full">
  <Skeleton variant='rectangular' height={100} width={"100%"} />
  </div>):(<Mcq mcqOptions={mcqData}  />)}
</>}

            
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
