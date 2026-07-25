import prisma from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { CreateDisciplineInput, UpdateDisciplineInput } from "./disciplines.schema";

export async function getAllDisciplines() {
  return prisma.discipline.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createDiscipline(data: CreateDisciplineInput) {
  const existing = await prisma.discipline.findUnique({
    where: { name: data.name },
  });
  if (existing) {
    throw new AppError("La disciplina ya existe", "DISCIPLINE_EXISTS", 400);
  }
  return prisma.discipline.create({
    data: { name: data.name },
  });
}

export async function updateDiscipline(id: number, data: UpdateDisciplineInput) {
  const existing = await prisma.discipline.findUnique({
    where: { name: data.name },
  });
  if (existing && existing.id !== id) {
    throw new AppError("Ya existe otra disciplina con ese nombre", "DISCIPLINE_EXISTS", 400);
  }

  return prisma.discipline.update({
    where: { id },
    data: { name: data.name },
  });
}

export async function deleteDiscipline(id: number) {
  // Check if there are classes associated
  const associatedClasses = await prisma.groupClass.count({
    where: { disciplineId: id },
  });
  if (associatedClasses > 0) {
    throw new AppError("No se puede eliminar la disciplina porque tiene clases asociadas", "DISCIPLINE_HAS_CLASSES", 400);
  }
  return prisma.discipline.delete({
    where: { id },
  });
}
