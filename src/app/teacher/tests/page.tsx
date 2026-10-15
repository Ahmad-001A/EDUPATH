"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ClipboardList,
  X,
  Loader2,
  Users,
  Save,
  Upload,
  FileSpreadsheet,
  Download,
  GraduationCap,
  Check,
} from "lucide-react";

type Option = { text: string; isCorrect: boolean };
type Question = { text: string; points: number; options: Option[] };
type Course = { id: string; title: string };
type Test = {
  id: string;
  title: string;
  description: string | null;
  course: { id: string; title: string };
  grades: number[];
  questions: any[];
  _count: { results: number };
  passScore: number;
  timeLimit: number;
};

export default function TeacherTestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<"manual" | "file">("manual");

  const [form, setForm] = useState({
    title: "",
    description: "",
    courseId: "",
    timeLimit: 0,
    passScore: 70,
  });
  const [grades, setGrades] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", points: 1, options: [{ text: "", isCorrect: false }] },
  ]);

  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "authenticated" && role !== "TEACHER" && role !== "ADMIN") {
      router.push("/");
    }
  }, [status, role, router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([
        fetch("/api/teacher/tests").then((r) => r.json()),
        fetch("/api/teacher/course").then((r) => r.json()),
      ]);
      setTests(Array.isArray(t) ? t : []);
      setCourses(Array.isArray(c) ? c : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchAll();
  }, [status]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      courseId: "",
      timeLimit: 0,
      passScore: 70,
    });
    setGrades([]);
    setQuestions([
      { text: "", points: 1, options: [{ text: "", isCorrect: false }] },
    ]);
    setImportMode("manual");
  };

  const toggleGrade = (g: number) => {
    setGrades((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g].sort((a, b) => a - b)
    );
  };

  const selectAllGrades = () =>
    setGrades(Array.from({ length: 11 }, (_, i) => i + 1));
  const clearAllGrades = () => setGrades([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", points: 1, options: [{ text: "", isCorrect: false }] },
    ]);
  };

  const removeQuestion = (qi: number) => {
    setQuestions(questions.filter((_, i) => i !== qi));
  };

  const updateQuestion = (qi: number, field: string, value: any) => {
    const copy = [...questions];
    (copy[qi] as any)[field] = value;
    setQuestions(copy);
  };

  const addOption = (qi: number) => {
    const copy = [...questions];
    copy[qi].options.push({ text: "", isCorrect: false });
    setQuestions(copy);
  };

  const removeOption = (qi: number, oi: number) => {
    const copy = [...questions];
    if (copy[qi].options.length <= 2) {
      alert("Должно быть минимум 2 варианта");
      return;
    }
    copy[qi].options = copy[qi].options.filter((_, i) => i !== oi);
    setQuestions(copy);
  };

  const updateOption = (qi: number, oi: number,
