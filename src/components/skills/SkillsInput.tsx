import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Link2, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Papa from 'papaparse';
import mammoth from 'mammoth';

// Example (dummy) values for demonstration. Replace with your real credentials for production use.
const LINKEDIN_CLIENT_ID = '86xk1v7w6dummy';
const LINKEDIN_REDIRECT_URI = encodeURIComponent('http://localhost:8082/linkedin-callback');
const LINKEDIN_SCOPE = 'r_liteprofile%20r_emailaddress';

const getLinkedInAuthUrl = () =>
  `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${LINKEDIN_REDIRECT_URI}&scope=${LINKEDIN_SCOPE}`;

const GITHUB_CLIENT_ID = 'Iv1.dummyclientid';
const GITHUB_REDIRECT_URI = encodeURIComponent('http://localhost:8082/github-callback');
const GITHUB_SCOPE = 'read:user user:email';

const getGitHubAuthUrl = () =>
  `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${GITHUB_SCOPE}`;

const SkillsInput = () => {
  const [manualSkills, setManualSkills] = useState('');
  const [skillsList, setSkillsList] = useState([
    'JavaScript', 'React', 'Python', 'SQL', 'Git'
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeUrlError, setResumeUrlError] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setSkillsList([...skillsList, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleBulkAdd = () => {
    const parsed = manualSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && !skillsList.includes(skill));
    if (parsed.length > 0) {
      setSkillsList([...skillsList, ...parsed]);
      setManualSkills('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Placeholder for file processing logic
      console.log('File uploaded:', file.name);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvError('');
    Papa.parse(file, {
      complete: (results) => {
        // Assume skills are in the first column, skip header if present
        let data = results.data as string[][];
        if (data.length && data[0][0].toLowerCase().includes('skill')) {
          data = data.slice(1);
        }
        const newSkills = data.map(row => row[0]?.trim()).filter(Boolean);
        if (newSkills.length === 0) {
          setCsvError('No skills found in CSV.');
          return;
        }
        setSkillsList(prev => [...prev, ...newSkills.filter(skill => !prev.includes(skill))]);
        setShowCSV(false);
      },
      error: () => setCsvError('Failed to parse CSV.'),
    });
  };

  const handleResumeUrlSubmit = async () => {
    setResumeUrlError('');
    if (!resumeUrl.trim()) {
      setResumeUrlError('Please enter a valid URL.');
      return;
    }
    // Placeholder: In a real app, fetch and process the file from the URL
    setShowUrlDialog(false);
    setResumeUrl('');
    alert('Resume import from URL is not yet implemented.');
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl border border-border/50">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-chrome bg-clip-text text-transparent mb-2">
          Skills Input Center
        </h1>
        <p className="text-muted-foreground">
          Add your skills manually, upload your resume, or import from professional platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass glow-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✍️</span>
              Manual Input
            </CardTitle>
            <CardDescription>
              Type your skills directly or add them one by one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bulk Skills Entry</label>
              <Textarea
                placeholder="Enter your skills separated by commas (e.g., JavaScript, Python, React, Node.js...)"
                value={manualSkills}
                onChange={(e) => setManualSkills(e.target.value)}
                className="glass min-h-[100px]"
              />
              <Button className="w-full glow-hover" onClick={handleBulkAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Parse & Add Skills
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Individual Skill</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter skill name"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="glass"
                />
                <Button onClick={addSkill} className="glow-hover">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass glow-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📄</span>
              Resume Upload
            </CardTitle>
            <CardDescription>
              Upload your resume for automatic skill extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center glass-hover">
              <div className="mx-auto w-12 h-12 chrome-gradient rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-background" />
              </div>
              <p className="text-sm font-medium mb-2">Drop your resume here</p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports PDF, DOC, DOCX files up to 5MB
              </p>
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
              <label htmlFor="resume-upload">
                <Button className="glow-hover" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="glass glass-hover"
                onClick={() => document.getElementById('resume-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              <Button
                variant="outline"
                className="glass glass-hover"
                onClick={() => setShowUrlDialog(true)}
              >
                <Link2 className="w-4 h-4 mr-2" />
                From URL
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔗</span>
            Platform Integrations
          </CardTitle>
          <CardDescription>
            Import skills from your professional profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="glass glass-hover h-16 flex-col"
              onClick={() => window.location.href = getLinkedInAuthUrl()}
            >
              <div className="w-8 h-8 bg-blue-600 rounded mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">in</span>
              </div>
              LinkedIn Import
            </Button>
            <Button
              variant="outline"
              className="glass glass-hover h-16 flex-col"
              onClick={() => window.location.href = getGitHubAuthUrl()}
            >
              <div className="w-8 h-8 bg-gray-900 rounded mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">GH</span>
              </div>
              GitHub Analysis
            </Button>
            <Button variant="outline" className="glass glass-hover h-16 flex-col" onClick={() => setShowCSV(true)}>
              <div className="w-8 h-8 bg-orange-500 rounded mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">CV</span>
              </div>
              CSV Import
            </Button>
          </div>
          {/* LinkedIn Dialog intentionally removed, as redirect is now handled directly */}
          {/* GitHub Dialog */}
          <Dialog open={showGitHub} onOpenChange={setShowGitHub}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>GitHub Analysis</DialogTitle>
                <DialogDescription>
                  Coming soon: Analyze your GitHub repositories to extract relevant skills.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          {/* CSV Import Dialog */}
          <Dialog open={showCSV} onOpenChange={setShowCSV}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>CSV Import</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with your skills (one skill per row or a column named 'Skill').
                </DialogDescription>
              </DialogHeader>
              <input type="file" accept=".csv" onChange={handleCSVUpload} />
              {csvError && <p className="text-destructive text-sm mt-2">{csvError}</p>}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Resume From URL Dialog */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Resume from URL</DialogTitle>
            <DialogDescription>
              Enter the direct link to your resume (PDF, DOC, DOCX).
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://example.com/your-resume.pdf"
            value={resumeUrl}
            onChange={e => setResumeUrl(e.target.value)}
          />
          {resumeUrlError && <p className="text-destructive text-sm mt-2">{resumeUrlError}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowUrlDialog(false)}>Cancel</Button>
            <Button onClick={handleResumeUrlSubmit}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏷️</span>
            Current Skills ({skillsList.length})
          </CardTitle>
          <CardDescription>
            Review and manage your skill portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 flex items-center gap-2 glass glass-hover"
              >
                {skill}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
          </div>
          {skillsList.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No skills added yet. Start by adding your first skill above!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsInput;

  


   
