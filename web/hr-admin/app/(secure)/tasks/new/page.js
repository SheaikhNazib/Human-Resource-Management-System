"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createTaskClient } from '@/actions/tasks/business';
import { useEmployees } from '@/actions/employees/business';

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string(),
  start_date_time: Yup.date().required("Start date is required"),
  end_date_time: Yup.date().required("End date is required"),
  estimated_time: Yup.string(),
  assigned_employees: Yup.array(),
  task_status: Yup.number().required(),
});

export default function NewTaskPage() {
  const router = useRouter();
  const { employees } = useEmployees();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-indigo-600">
          <div>
            <h1 className="text-2xl font-semibold text-white">Create Task</h1>
            <p className="text-sm text-indigo-100 mt-1">Fill out the details below to create a new task.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-indigo-100">Quick Tips</div>
            <div className="text-sm text-white/90">Assign employees and set realistic estimates</div>
          </div>
        </div>

        <div className="p-6">
          <Formik
        initialValues={{
          title: "",
          description: "",
          start_date_time: "",
          end_date_time: "",
          estimated_time: "",
          assigned_employees: [],
          task_status: 1,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          const payload = {
            title: values.title,
            description: values.description,
            start_date_time: values.start_date_time || null,
            end_date_time: values.end_date_time || null,
            estimated_time: values.estimated_time || null,
            assigned_employees: Array.isArray(values.assigned_employees) ? values.assigned_employees.map((v) => Number(v)) : [],
            task_status: Number(values.task_status),
          };
          const res = await createTaskClient(payload);
          setSubmitting(false);
          if (res.success) {
            router.push('/tasks/list');
          } else {
            alert(res.error || 'Create failed');
          }
        }}
      >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Title <span className="text-red-500">*</span></label>
                      <Field name="title" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900" />
                      <div className="text-red-500 text-sm"><ErrorMessage name="title" /></div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Description</label>
                      <Field as="textarea" name="description" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900" rows={4} />
                      <div className="text-red-500 text-sm"><ErrorMessage name="description" /></div>
                    </div>
                  </div>
                </section>

                <section className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Scheduling</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Start Date <span className="text-red-500">*</span></label>
                      <Field type="date" name="start_date_time" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900" />
                      <div className="text-red-500 text-sm"><ErrorMessage name="start_date_time" /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">End Date <span className="text-red-500">*</span></label>
                      <Field type="date" name="end_date_time" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900" />
                      <div className="text-red-500 text-sm"><ErrorMessage name="end_date_time" /></div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Estimated Time</label>
                      <Field name="estimated_time" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900" placeholder="e.g. 5h" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700">Status</label>
                      <Field as="select" name="task_status" className="mt-1 w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900">
                        <option value={1}>Open</option>
                        <option value={2}>In Progress</option>
                        <option value={3}>Done</option>
                      </Field>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-lg shadow-sm">
                  <h4 className="text-md font-medium mb-2">Assign Employees</h4>
                  <p className="text-xs text-zinc-500 mb-3">Search and add employees to this task.</p>
                  <AssignedEmployeesSelect
                    employees={employees}
                    value={values.assigned_employees}
                    onChange={(val) => setFieldValue('assigned_employees', val)}
                  />
                </section>

                <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-lg shadow-sm">
                  <h4 className="text-md font-medium mb-2">Actions</h4>
                  <div className="flex flex-col gap-3">
                    <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-indigo-600 text-white rounded">{isSubmitting ? 'Saving...' : 'Create Task'}</button>
                    <button type="button" onClick={() => router.back()} className="w-full px-4 py-2 border rounded">Cancel</button>
                  </div>
                </section>
              </aside>
            </Form>
          )}
      </Formik>
        </div>
      </div>
    </div>
  );
}

  function AssignedEmployeesSelect({ employees = [], value = [], onChange }) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const rootRef = React.useRef(null);

    React.useEffect(() => {
      function handleDocClick(e) {
        if (!rootRef.current) return;
        if (!rootRef.current.contains(e.target)) setOpen(false);
      }
      function handleKey(e) {
        if (e.key === 'Escape') setOpen(false);
      }
      document.addEventListener('click', handleDocClick);
      document.addEventListener('keydown', handleKey);
      return () => {
        document.removeEventListener('click', handleDocClick);
        document.removeEventListener('keydown', handleKey);
      };
    }, []);

  const filtered = React.useMemo(() => {
    if (!query) return employees;
    const q = query.toLowerCase();
    return employees.filter((e) => {
      const name = (e.firstName ? `${e.firstName} ${e.lastName || ''}` : e.name || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      return name.includes(q) || email.includes(q) || String(e.id).includes(q);
    });
  }, [employees, query]);

  function add(id) {
    if (value.includes(id)) return;
    onChange([...(value || []), id]);
    setQuery("");
    setOpen(false);
  }

  function remove(id) {
    onChange((value || []).filter((v) => v !== id));
  }

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex flex-wrap gap-2 items-center border rounded px-2 py-2">
        {(value || []).map((id) => {
          const emp = employees.find((e) => e.id === id) || { id, name: `#${id}` };
          const label = emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : emp.name || emp.email || `#${id}`;
          return (
            <span key={id} className="bg-zinc-100 text-zinc-800 px-2 py-1 rounded flex items-center gap-2 text-sm">
              <span>{label}</span>
              <button type="button" onClick={() => remove(id)} className="text-zinc-500 hover:text-zinc-800">×</button>
            </span>
          );
        })}

        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          placeholder="Search employees..."
          className="flex-1 min-w-40 outline-none border-none px-2 py-1"
        />
      </div>

      {open && filtered && filtered.length > 0 && (
        <div className="absolute z-40 mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow max-h-48 overflow-auto">
          {filtered.map((e) => {
            const label = e.firstName ? `${e.firstName} ${e.lastName || ''}` : e.name || e.email || `#${e.id}`;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => add(e.id)}
                className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <div className="text-sm">{label}</div>
                <div className="text-xs text-zinc-400 ml-auto">#{e.id}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}