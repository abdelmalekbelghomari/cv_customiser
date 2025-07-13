import { useState, useRef } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Sparkles, Copy } from 'lucide-react';

const CVCustomiser = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);
  const [responseBody, setResponseBody] = useState(null);

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

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      setStatus({ type: 'error', message: 'Please enter a job description.' });
      return;
    }

    setIsAnalyzing(true);
    setStatus({ type: '', message: '' });

    try {
      // Create the request payload
      const payload = {
        jobDescription: jobDescription.trim(),
        jobTitle: jobTitle.trim()
      };

      // Call Gemini analysis endpoint
      const response = await fetch('https://shiner-tender-virtually.ngrok-free.app/api/analyze-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log('Job description analysis successful:', result.data);
          setAnalysisResult(result.data);
          setResponseBody(analysisResult.body);
          setStatus({ 
            type: 'success', 
            message: 'Job description analyzed successfully! CV recommendations generated.' 
          });
        } else {
          throw new Error(result.message || 'Analysis failed');
        }
      } else {
        let errorMessage = 'Failed to analyze job description';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Error analyzing job description:', error);
      setStatus({ 
        type: 'error', 
        message: error.message || 'An error occurred while analyzing the job description.' 
      });
    } finally {
      setIsAnalyzing(false);
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
      formData.append('jobDescription', jobDescription);
      
      // Include analysis results if available
      if (analysisResult) {
        formData.append('analysisResult', JSON.stringify(analysisResult));
      }
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Call your actual API endpoint
      const response = await fetch('https://shiner-tender-virtually.ngrok-free.app/api/generate-cv', {
          method: 'POST',
          body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log('CV generation successful:', result.data);
          
          // Si votre API retourne déjà un PDF URL
          if (result.data.pdfUrl) {
            setGeneratedPdfUrl(result.data.pdfUrl);
            setStatus({ 
              type: 'success', 
              message: 'CV generated successfully! You can now download it.' 
            });
          } else {
            // En attendant l'implémentation du PDF
            setStatus({ 
              type: 'success', 
              message: `CV processing completed for "${result.data.jobTitle}". PDF generation will be implemented soon.` 
            });
          }
        } else {
          throw new Error(result.message || 'Server returned unsuccessful response');
        }
      } else {
        // Gestion des erreurs HTTP
        let errorMessage = 'Failed to generate CV';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Si on ne peut pas parser la réponse d'erreur
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Error generating CV:', error);
      setStatus({ 
        type: 'error', 
        message: error.message || 'An error occurred while generating the CV.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCV = () => {
    if (!generatedPdfUrl) return;
    
    // Use your network IP
    const fullDownloadUrl = `https://shiner-tender-virtually.ngrok-free.app${generatedPdfUrl}`;
    window.open(fullDownloadUrl, '_blank');
  };

  const resetForm = () => {
    setJobTitle('');
    setJobDescription('');
    setLogoFile(null);
    setLogoPreview(null);
    setGeneratedPdfUrl(null);
    setAnalysisResult(null);
    setStatus({ type: '', message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setStatus({ type: 'success', message: 'Copied to clipboard!' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI-Powered CV Customizer
            </h1>
            <p className="text-gray-600">
              Upload a company logo, add job details, and let AI optimize your CV for the perfect match
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
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
                      <Upload size={20} />
                      <span>Upload logo</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG (square format)
                    </p>
                  </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here. The AI will analyze it to optimize your CV..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows="8"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={analyzeJobDescription}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Sparkles size={20} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Job'}</span>
                </button>
                
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
              {/* AI Analysis Results */}
              {analysisResult && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <Sparkles className="mr-2" size={20} />
                    AI Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-purple-700 mb-2">Key Skills Required:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.body.keySkills?.map((skill, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-purple-700 mb-2">Recommendations:</h4>
                      <div className="bg-white rounded-lg p-3 relative">
                        <button
                          onClick={() => copyToClipboard(analysisResult.body.recommendations)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                          <Copy size={16} />
                        </button>
                        <p className="text-sm text-gray-700 pr-8">
                          <ul className="space-y-2">
                            {analysisResult.body.recommendations?.map((rec, index) => (
                              <li key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-purple-700 mb-2">Match Score:</h4>
                      <div className="bg-white rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${analysisResult.body.score * 100 || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {analysisResult.body.score * 100|| 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis & Preview Section */}
            <div className="space-y-6">

              {/* Preview/Output Section */}
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
                        <li>• Job Description: {jobDescription ? 'Analyzed' : 'Not provided'}</li>
                        <li>• AI Optimization: {analysisResult ? 'Applied' : 'Not applied'}</li>
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
                    <p className="text-sm">
                      {analysisResult 
                        ? "Analysis complete! Now generate your optimized CV" 
                        : "Enter job details and analyze to create your customized CV"
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Enter the job title and paste the job description</li>
                  <li>Click "Analyze Job" to get AI recommendations</li>
                  <li>Upload the company logo (optional)</li>
                  <li>Click "Generate CV" to create your optimized CV</li>
                  <li>Download your personalized CV as a PDF</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI-Powered CV Customizer. All rights reserved.</p>
          <p className="mt-1">Made with ❤️ by <a href="https://www.linkedin.com/in/abdelmalek-belghomari/" className="text-blue-600 hover:text-blue-800">Abdelmalek Belghomari</a></p>
        </div>
      </div>
    </div>
  );
};

export default CVCustomiser;