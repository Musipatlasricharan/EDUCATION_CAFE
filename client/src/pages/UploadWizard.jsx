import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUploadResource } from '../hooks/useResources'
import { UploadCloud, File, X, CheckCircle, Link as LinkIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function UploadWizard() {
  const [step, setStep] = useState(1)
  const [uploadType, setUploadType] = useState('file') // 'file' or 'link'
  const [file, setFile] = useState(null)
  const [linkUrl, setLinkUrl] = useState('')
  const { register, handleSubmit, watch } = useForm()
  const uploadMutation = useUploadResource()
  const navigate = useNavigate()

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
  })

  const onSubmit = (data) => {
    if (uploadType === 'file' && !file) return
    if (uploadType === 'link' && !linkUrl) return

    const formData = new FormData()
    if (uploadType === 'file') {
      formData.append('file', file)
    } else {
      formData.append('linkUrl', linkUrl)
    }
    
    Object.keys(data).forEach(key => formData.append(key, data[key]))

    uploadMutation.mutate(formData, {
      onSuccess: () => setStep(3)
    })
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Upload Resource</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Share your knowledge with the community and earn points.</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, opacity: step >= s ? 1 : 0.4, transition: 'opacity 0.3s' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: step >= s ? 'var(--accent)' : 'var(--border)', color: step >= s ? '#fff' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, transition: 'background-color 0.3s' }}>
              {s}
            </div>
            <div style={{ height: 3, flex: 1, backgroundColor: step > s ? 'var(--accent)' : 'var(--border)', borderRadius: 2, transition: 'background-color 0.3s' }}></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '40px 48px' }}>
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              <button 
                onClick={() => setUploadType('file')}
                style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius)', border: `2px solid ${uploadType === 'file' ? 'var(--accent)' : 'var(--border)'}`, backgroundColor: uploadType === 'file' ? 'rgba(59, 130, 246, 0.05)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}
              >
                <UploadCloud size={20} /> Upload File
              </button>
              <button 
                onClick={() => setUploadType('link')}
                style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius)', border: `2px solid ${uploadType === 'link' ? 'var(--accent)' : 'var(--border)'}`, backgroundColor: uploadType === 'link' ? 'rgba(59, 130, 246, 0.05)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}
              >
                <LinkIcon size={20} /> Share Link
              </button>
            </div>

            {uploadType === 'file' ? (
              <>
                <div 
                  {...getRootProps()} 
                  style={{
                    border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', padding: '60px 40px', textAlign: 'center',
                    backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <input {...getInputProps()} />
                  <div style={{ width: 72, height: 72, margin: '0 auto 20px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <UploadCloud size={36} color="var(--accent)" />
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Drag & drop your file here</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Unlimited size. Supports videos, PDFs, slides, etc.</p>
                </div>

                {file && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, border: '1px solid var(--accent)', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius)', marginTop: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <File size={28} color="var(--accent)" />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 16 }}>{file.name}</p>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} style={{ color: 'var(--danger)', padding: 8, borderRadius: '50%' }}><X size={24} /></button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Resource URL</label>
                <input 
                  type="url" 
                  className="input-field" 
                  placeholder="https://example.com/notes" 
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{ padding: '16px' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
              <button disabled={(uploadType === 'file' && !file) || (uploadType === 'link' && !linkUrl)} onClick={() => setStep(2)} className="btn-primary" style={{ padding: '12px 32px', fontSize: 16 }}>Next Step</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>Resource Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Title</label>
                <input className="input-field" {...register('title', { required: true })} placeholder="e.g. Data Structures Midterm Review" style={{ padding: '12px 16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Description</label>
                <textarea className="input-field" {...register('description', { required: true })} placeholder="What's included in this resource?" rows={4} style={{ padding: '12px 16px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Type</label>
                  <select className="input-field" {...register('type', { required: true })} style={{ padding: '12px 16px' }}>
                    <option value="notes">Notes</option>
                    <option value="pdf">Past Paper (PDF)</option>
                    <option value="slides">Presentation Slides</option>
                    <option value="video">Video</option>
                    <option value="link">External Link</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Subject</label>
                  <input className="input-field" {...register('subject', { required: true })} placeholder="e.g. CS101" style={{ padding: '12px 16px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                <button type="button" onClick={() => setStep(1)} className="btn-primary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 32px' }}>Back</button>
                <button type="submit" disabled={uploadMutation.isPending} className="btn-primary" style={{ padding: '12px 32px', fontSize: 16 }}>
                  {uploadMutation.isPending ? 'Publishing...' : 'Publish Resource'}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CheckCircle size={88} color="var(--success)" style={{ margin: '0 auto 24px', animation: 'scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Upload Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: 16 }}>You earned 10 points for sharing knowledge with your peers.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button type="button" onClick={() => { setFile(null); setLinkUrl(''); setStep(1) }} className="btn-primary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '12px 24px' }}>Upload Another</button>
              <button type="button" onClick={() => navigate('/')} className="btn-primary" style={{ padding: '12px 24px' }}>Go to Home</button>
            </div>
            <style>{`@keyframes scaleUp { from { transform: scale(0); } to { transform: scale(1); } }`}</style>
          </div>
        )}
      </div>
    </div>
  )
}
