import React, { useState } from 'react';
import { Download, Film, FileText, Loader2, CheckCircle2, Video } from 'lucide-react';
import { ShortFilmProject } from '../../types/ebook';
import { downloadScreenplayScript } from '../../utils/fileDownloader';

interface VideoExporterProps {
  project: ShortFilmProject;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onStartRecordingPlayback: () => void;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({
  project,
  canvasRef,
  onStartRecordingPlayback,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const totalRuntimeSeconds = project.scenes.reduce((acc, s) => acc + s.duration, 0);

  const startCanvasRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('Video canvas not ready. Please select a scene first.');
      return;
    }

    try {
      setIsRecording(true);
      setRecordProgress(0);
      setRecordedVideoUrl(null);

      // Capture canvas stream at 30fps
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 3000000 // 3 Mbps crisp quality
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
        setRecordProgress(100);

        // Auto download video
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `${project.title.toLowerCase().replace(/\s+/g, '-')}-short-film.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

      // Start recording
      mediaRecorder.start();
      onStartRecordingPlayback();

      // Track recording progress
      const startTime = Date.now();
      const totalMs = totalRuntimeSeconds * 1000;

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(99, Math.round((elapsed / totalMs) * 100));
        setRecordProgress(pct);

        if (elapsed >= totalMs) {
          clearInterval(progressInterval);
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }
      }, 200);

    } catch (err: any) {
      console.error('Error starting video recording:', err);
      setIsRecording(false);
      alert('MediaRecorder is restricted in this browser session. You can still export the Screenplay Script and Audio.');
    }
  };

  return (
    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-serif font-bold text-stone-900">
            Export Short Film & Screenplay
          </h3>
          <p className="text-xs text-stone-500">
            Compile the cinematic short film into a high-definition video file or screenplay script.
          </p>
        </div>

        <div className="text-xs font-mono text-stone-500">
          Estimated Runtime: <span className="font-bold text-stone-900">{totalRuntimeSeconds}s</span>
        </div>
      </div>

      {isRecording && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
              <span>Rendering & Recording Video ({recordProgress}%)...</span>
            </span>
            <span className="font-mono">Do not leave this tab</span>
          </div>
          <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-700 h-2 transition-all duration-200"
              style={{ width: `${recordProgress}%` }}
            />
          </div>
        </div>
      )}

      {recordedVideoUrl && !isRecording && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Short film video rendered successfully and downloaded!</span>
          </span>
          <a
            href={recordedVideoUrl}
            download={`${project.title.toLowerCase().replace(/\s+/g, '-')}-short-film.webm`}
            className="font-bold underline hover:text-emerald-950"
          >
            Download Again (.webm)
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={startCanvasRecording}
          disabled={isRecording}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
        >
          <Video className="w-4 h-4 text-amber-300" />
          <span>{isRecording ? 'Recording in progress...' : 'Record & Export Video (.webm)'}</span>
        </button>

        <button
          onClick={() => downloadScreenplayScript(project)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4 text-amber-800" />
          <span>Download Screenplay Script (.txt)</span>
        </button>
      </div>
    </div>
  );
};
