const requiredFields = new Set(['id', 'name', 'title', 'employeeId', 'category']);

export const isRequiredField = (key) => requiredFields.has(key);

export function validateRecord({ fields, values, page, employees, selected }) {
  const errors = Object.fromEntries(
    fields
      .filter((item) => requiredFields.has(item.key) && !values[item.key]?.toString().trim())
      .map((item) => [item.key, `${item.label} is required.`]),
  );
  if (page === 'Employee Master' && employees.some((employee) => (
    employee.id.toLowerCase() === (values.id || '').toLowerCase() && employee.id !== selected?.id
  ))) {
    errors.id = 'This employee ID already exists.';
  }
  return errors;
}
