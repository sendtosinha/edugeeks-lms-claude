'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  CheckCircle, Circle, Play, FileText, ChevronDown,
  ChevronRight, Download, MessageCircle, BookOpen, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LearnPage() {
  const { slug, lectureId } = useParams() as { slug: string; lectureId?: string };
  const [activeLectureId, setActiveLectureId] = useState<string | null>(lectureId || null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [showNotes, setShowNotes] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  // Fetch course with curriculum
  const { data: courseData } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => api.get(`/courses/${slug}`).then(r => r.data),
  });

  // Fetch active lecture
  const { data: lectureData, refetch: refetchLecture } = useQuery({
    queryKey: ['lecture', activeLectureId],
    queryFn: () => api.get(`/lectures/${activeLectureId}`).then(r => r.data),
    enabled: !!activeLectureId,
  });

  const course = courseData?.course;
  const lecture = lectureData?.lecture;
  const progress = lectureData?.progress;

  // Auto-expand current chapter
  useEffect(() => {
    if (activeLectureId && course?.chapters) {
      course.chapters.forEach((ch: any) => {
        if (ch.lectures.some((l: any) => l.id === activeLectureId)) {
          setExpandedChapters(prev => new Set([...prev, ch.id]));
        }
      });
    }
  }, [activeLectureId, course]);

  // Start first lecture if none selected
  useEffect(() => {
    if (!activeLectureId && course?.chapters?.[0]?.lectures?.[0]) {
      setActiveLectureId(course.chapters[0].lectures[0].id);
    }
  }, [course]);

  // Progress tracking mutation
  const { mutate: updateProgress } = useMutation({
    mutationFn: ({ lectureId, watchedTime, isCompleted }: any) =>
      api.patch(`/dashboard/progress/${lectureId}`, { watchedTime, isCompleted }),
  });

  // Mark complete
  const handleMarkComplete = () => {
    if (!activeLectureId) return;
    updateProgress({ lectureId: activeLectureId, watchedTime: watchedSeconds, isCompleted: true });
    toast.success('Lecture marked as complete! ✅');
    refetchLecture();
  };

  // Next lecture
  const getNextLecture = () => {
    if (!course || !activeLectureId) return null;
    const allLectures: any[] = [];
    course.chapters.forEach((ch: any) => ch.lectures.forEach((l: any) => allLectures.push(l)));
    const idx = allLectures.findIndex(l => l.id === activeLectureId);
    return idx < allLectures.length - 1 ? allLectures[idx + 1] : null;
  };

  const nextLecture = getNextLecture();

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-brand-400" />
          <span className="text-white font-semibold text-sm truncate max-w-sm">{course?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotes(!showNotes)}
            className="text-slate-300 hover:text-white text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
            <FileText className="w-4 h-4" /> Notes
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — Playlist */}
        <aside className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto shrink-0 hidden md:block">
          <div className="p-4 border-b border-slate-700">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Course Content</p>
          </div>

          {course?.chapters?.map((chapter: any) => (
            <div key={chapter.id}>
              <button
                onClick={() => setExpandedChapters(prev => {
                  const next = new Set(prev);
                  next.has(chapter.id) ? next.delete(chapter.id) : next.add(chapter.id);
                  return next;
                })}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors text-left">
                <span className="text-white text-sm font-medium">{chapter.title}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedChapters.has(chapter.id) ? 'rotate-180' : ''}`} />
              </button>

              {expandedChapters.has(chapter.id) && (
                <div className="bg-slate-900/50">
                  {chapter.lectures?.map((lec: any) => {
                    const isActive = lec.id === activeLectureId;
                    const isDone = courseData?.userProgress?.find((p: any) => p.lectureId === lec.id)?.isCompleted;

                    return (
                      <button key={lec.id} onClick={() => setActiveLectureId(lec.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isActive ? 'bg-brand-900/50 border-l-2 border-brand-500' : 'hover:bg-slate-700/30 border-l-2 border-transparent'
                        }`}>
                        <div className="shrink-0">
                          {isDone
                            ? <CheckCircle className="w-4 h-4 text-green-400" />
                            : isActive
                              ? <Play className="w-4 h-4 text-brand-400 fill-brand-400" />
                              : <Circle className="w-4 h-4 text-slate-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-brand-300' : 'text-slate-300'}`}>
                            {lec.title}
                          </p>
                          {lec.videoDuration && (
                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {formatDuration(lec.videoDuration)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Center — Video Player */}
        <main className="flex-1 overflow-y-auto bg-slate-900">
          {lecture ? (
            <div className="max-w-4xl mx-auto p-4 md:p-6">
              {/* Video */}
              <div className="video-wrapper mb-6 rounded-2xl overflow-hidden shadow-2xl">
                {lecture.videoUrl ? (
                  lecture.videoProvider === 'vimeo' ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${lecture.videoUrl}?autoplay=0&color=2563EB`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <video
                      src={lecture.videoUrl}
                      controls
                      className="absolute inset-0 w-full h-full"
                      onTimeUpdate={(e) => setWatchedSeconds(Math.floor((e.target as HTMLVideoElement).currentTime))}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-900 to-slate-900 flex items-center justify-center">
                    <div className="text-center text-white/50">
                      <Play className="w-16 h-16 mx-auto mb-3" />
                      <p>Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lecture Info */}
              <div className="text-white">
                <h1 className="font-display text-xl md:text-2xl font-bold mb-2">{lecture.title}</h1>
                {lecture.description && (
                  <p className="text-slate-400 text-sm mb-4">{lecture.description}</p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {!progress?.isCompleted ? (
                    <button onClick={handleMarkComplete}
                      className="btn-primary text-sm py-2.5">
                      <CheckCircle className="w-4 h-4" /> Mark as Complete
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                      <CheckCircle className="w-5 h-5" /> Completed!
                    </div>
                  )}

                  {lecture.notesUrl && (
                    <a href={lecture.notesUrl} download
                      className="flex items-center gap-2 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 px-4 py-2 rounded-xl text-sm transition-colors">
                      <Download className="w-4 h-4" /> Download Notes
                    </a>
                  )}

                  {nextLecture && (
                    <button onClick={() => setActiveLectureId(nextLecture.id)}
                      className="flex items-center gap-2 text-brand-400 hover:text-brand-300 ml-auto text-sm font-semibold">
                      Next Lecture <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-white/30">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4" />
                <p>Select a lecture to start watching</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
