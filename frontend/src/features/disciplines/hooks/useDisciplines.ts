import { useState, useEffect, useCallback } from "react";
import {
  getDisciplines,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  enrollMember,
  unenrollMember,
  type Discipline,
  type GroupClass,
  type CreateDisciplineInput,
  type CreateClassInput,
} from "../api/disciplinesApi";

export function useDisciplines(professorId?: number) {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  const fetchDisciplines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDisciplines();
      setDisciplines(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar disciplinas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    setIsLoadingClasses(true);
    setClassesError(null);
    try {
      const data = await getClasses(professorId);
      setClasses(data);
    } catch (err: any) {
      setClassesError(err.message || "Error al cargar clases");
    } finally {
      setIsLoadingClasses(false);
    }
  }, [professorId]);

  useEffect(() => {
    fetchDisciplines();
    fetchClasses();
  }, [fetchDisciplines, fetchClasses]);

  const addDiscipline = async (data: CreateDisciplineInput) => {
    setError(null);
    try {
      const res = await createDiscipline(data);
      setDisciplines((prev) => [...prev, res]);
      return res;
    } catch (err: any) {
      setError(err.message || "Error al crear disciplina");
      return null;
    }
  };

  const editDiscipline = async (id: number, data: CreateDisciplineInput) => {
    setError(null);
    try {
      const res = await updateDiscipline(id, data);
      setDisciplines((prev) => prev.map((d) => (d.id === id ? res : d)));
      return res;
    } catch (err: any) {
      setError(err.message || "Error al actualizar disciplina");
      return null;
    }
  };

  const removeDiscipline = async (id: number) => {
    setError(null);
    try {
      await deleteDiscipline(id);
      setDisciplines((prev) => prev.filter((d) => d.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar disciplina");
      return false;
    }
  };

  const addClass = async (data: CreateClassInput) => {
    setClassesError(null);
    try {
      const res = await createClass(data);
      // Fetch classes again to get the populated discipline and user names
      await fetchClasses();
      return res;
    } catch (err: any) {
      setClassesError(err.message || "Error al crear clase");
      return null;
    }
  };

  const editClass = async (id: number, data: CreateClassInput) => {
    setClassesError(null);
    try {
      const res = await updateClass(id, data);
      await fetchClasses();
      return res;
    } catch (err: any) {
      setClassesError(err.message || "Error al actualizar clase");
      return null;
    }
  };

  const removeClass = async (id: number) => {
    setClassesError(null);
    try {
      await deleteClass(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err: any) {
      setClassesError(err.message || "Error al eliminar clase");
      return false;
    }
  };

  const enroll = async (classId: number, memberId: number) => {
    try {
      await enrollMember(classId, memberId);
      await fetchClasses();
      return true;
    } catch (err: any) {
      setClassesError(err.message || "Error al inscribir alumno");
      return false;
    }
  };

  const unenroll = async (classId: number, memberId: number) => {
    try {
      await unenrollMember(classId, memberId);
      await fetchClasses();
      return true;
    } catch (err: any) {
      setClassesError(err.message || "Error al desinscribir alumno");
      return false;
    }
  };

  return {
    disciplines,
    isLoading,
    error,
    fetchDisciplines,
    addDiscipline,
    editDiscipline,
    removeDiscipline,
    
    classes,
    isLoadingClasses,
    classesError,
    fetchClasses,
    addClass,
    editClass,
    removeClass,
    enroll,
    unenroll,
  };
}
