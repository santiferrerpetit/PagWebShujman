export function getCategoryFromBirthDate(birthDate: Date): string {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 5) return "Menor";
  if (age <= 12) return "Infantil";
  if (age <= 17) return "Juvenil";
  if (age <= 59) return "Adulto";
  return "Senior";
}
