import { useEffect, useState } from "react";

export default function MermaidEditor({ running, result }) {
  const [iframeKey, setIframeKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [transformOrigin, setTransformOrigin] = useState('center center');

  useEffect(() => {
    // Force iframe reload when result changes
    setIframeKey((prev) => prev + 1);
  }, [result]);

  const handleDoubleClick = (e) => {
    e.preventDefault();
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    
    // Calculate click position relative to container
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTransformOrigin(`${x}% ${y}%`);
    setZoomLevel(prev => prev === 1 ? 2 : 1);
  };

  const generateSrcDoc = (script) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mermaid Editor</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.0/mermaid.min.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0;
            font-family: sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh;
            background: white;
            overflow: hidden;
          }
          #mermaid-container { 
            width: 100%; 
            height: 100%;
            display: flex; 
            justify-content: center; 
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
          .mermaid {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          svg {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            display: block;
          }
        </style>
      </head>
      <body>
        <div id="mermaid-container">
          <pre class="mermaid">
            ${script}
          </pre>
        </div>
        <script>
          try {
            mermaid.initialize({ 
              startOnLoad: true,
              theme: 'default',
              securityLevel: 'loose'
            });
          } catch (error) {
            console.error("Mermaid rendering error:", error);
            document.body.innerHTML += '<p style="color:red;">Error in Mermaid script. Check console.</p>';
          }
        </script>
      </body>
    </html>`;

  if (!running) {
    return (
      <div className="w-full min-h-[500px] bg-gray-100 rounded text-sm text-gray-400 flex justify-center items-center">
        No diagrams running
      </div>
    );
  }

  return (
    <div 
      className="w-full min-h-[500px] border border-gray-300 rounded overflow-hidden relative"
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: 'zoom-in',
        transform: `scale(${zoomLevel})`,
        transformOrigin: transformOrigin,
        transition: 'transform 0.3s ease-in-out',
        willChange: 'transform'
      }}
    >
      <iframe 
        key={iframeKey}
        width="100%" 
        height="100%" 
        srcDoc={generateSrcDoc(result)} 
        sandbox="allow-scripts"
        className="w-full h-full"
        style={{ 
          border: 'none',
          minHeight: '500px',
          pointerEvents: 'none' // Allow clicks to pass through to parent
        }}
      />
    </div>
  );
}
