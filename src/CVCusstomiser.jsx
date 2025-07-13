import { useState, useRef } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';

const CVCustomiser = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target.result);
        reader.readAsDataURL(file);
        setStatus({ type: 'success', message: 'Logo uploaded successfully!' });
      } else {
        setStatus({ type: 'error', message: 'Please upload a valid image file.' });
      }
    }
  };

  const generateCustomizedCV = async () => {
    if (!jobTitle.trim()) {
      setStatus({ type: 'error', message: 'Please enter a job title.' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: '', message: '' });

    try {
      // Create FormData to send both text and file
      const formData = new FormData();
      formData.append('jobTitle', jobTitle);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Mock API endpoint - replace with your actual endpoint
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        body: formData
      });

      // Since this is a mock, we'll simulate the response
      // In a real scenario, you'd handle the actual API response
      if (response.ok) {
        // Mock successful response
        const result = await response.json();
        setGeneratedPdfUrl(result.pdfUrl || '#mock-pdf-url');
        setStatus({ 
          type: 'success', 
          message: 'CV generated successfully! You can now download it.' 
        });
      } else {
        throw new Error('Failed to generate CV');
      }
    } catch (error) {
      // Mock the API call since endpoint doesn't exist yet
      setTimeout(() => {
        // Simulate successful generation
        setGeneratedPdfUrl('#mock-pdf-url');
        setStatus({ 
          type: 'success', 
          message: 'CV generated successfully! (Mock response - implement backend to get actual PDF)' 
        });
        setIsProcessing(false);
      }, 2000);
      return;
    }

    setIsProcessing(false);
  };

  const downloadCV = () => {
    if (!generatedPdfUrl) return;
    
    // In a real implementation, this would download the actual PDF
    // For now, we'll just show an alert
    alert('In a real implementation, this would download your customized CV PDF file.');
    
    // Real implementation would be something like:
    // window.open(generatedPdfUrl, '_blank');
    // or create a download link
  };

  const resetForm = () => {
    setJobTitle('');
    setLogoFile(null);
    setLogoPreview(null);
    setGeneratedPdfUrl(null);
    setStatus({ type: '', message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              CV Customizer
            </h1>
            <p className="text-gray-600">
              Upload a company logo and add a job title to customize your CV
            </p>
          </div>

          {/* Status Messages */}
          {status.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              status.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Intern"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center space-x-2 mx-auto text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Upload size={24} />
                    <span>Click to upload logo</span>
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG or PDF files (recommended: square format)
                  </p>
                </div>
              </div>

              {logoPreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</h3>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-20 mx-auto object-contain"
                  />
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={generateCustomizedCV}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText size={20} />
                  <span>{isProcessing ? 'Generating CV...' : 'Generate CV'}</span>
                </button>
                
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Preview/Output Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Preview & Download
                </h3>
                
                {generatedPdfUrl ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h4 className="font-medium text-gray-700 mb-2">Customization Summary:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Job Title: {jobTitle || 'Not specified'}</li>
                        <li>• Company Logo: {logoFile ? logoFile.name : 'Not uploaded'}</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={downloadCV}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download size={20} />
                      <span>Download CV</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Enter your details and click "Generate CV" to create your customized CV</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Enter the job title you're applying for</li>
                  <li>Upload the company logo (optional)</li>
                  <li>Click "Generate CV" to create a customized version</li>
                  <li>Download your personalized CV as a PDF</li>
                </ol>
              </div>

              {/* API Info */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Development Note:</h4>
                <p className="text-sm text-yellow-700">
                  Currently using mock API responses. Implement the <code className="bg-yellow-100 px-1 rounded">/api/generate-cv</code> endpoint 
                  to handle the FormData with jobTitle and logo file, then return the generated PDF URL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVCustomiser;