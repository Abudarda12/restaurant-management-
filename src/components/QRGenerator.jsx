import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRGenerator = () => {
  const [tableNum, setTableNum] = useState("");
  const [qrValue, setQrValue] = useState("");

  const generateQR = () => {
    if (!tableNum) return alert("Please enter a table number");
    
    // Replace with your actual Vercel Frontend URL
    const baseUrl = window.location.origin; 
    setQrValue(`${baseUrl}/menu?table=${tableNum}`);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("table-qr");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `Table_${tableNum}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold mb-4">Table QR Generator</h2>
      
      <input
        type="number"
        placeholder="Enter Table Number"
        value={tableNum}
        onChange={(e) => setTableNum(e.target.value)}
        className="border-2 p-2 rounded-lg w-full mb-4 outline-none focus:border-[#EF4F5F]"
      />
      
      <button 
        onClick={generateQR}
        className="bg-gray-900 text-white px-6 py-2 rounded-lg w-full font-bold hover:bg-black transition"
      >
        Generate QR Code
      </button>

      {qrValue && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="p-4 border-4 border-gray-100 rounded-xl">
            <QRCodeCanvas 
              id="table-qr"
              value={qrValue} 
              size={200} 
              level={"H"} // High error correction
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-gray-500 font-mono">{qrValue}</p>
          <button 
            onClick={downloadQR}
            className="text-[#EF4F5F] font-bold border-2 border-[#EF4F5F] px-4 py-2 rounded-lg hover:bg-[#EF4F5F] hover:text-white transition"
          >
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;