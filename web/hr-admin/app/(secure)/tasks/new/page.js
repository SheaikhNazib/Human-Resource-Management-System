"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createTaskClient } from '@/actions/tasks/business';
import { useEmployees } from '@/actions/employees/business';
import { Calendar, Users, CheckCircle, FileText, Clock } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const { employees } = useEmployees();

  const employeeId = searchParams.get('employeeId');
  const initialAssigned = employeeId ? [Number(employeeId)] : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-6 bg-indigo-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Task</h1>
              <p className="text-sm text-indigo-100 mt-1">Fill out the details below to create a new task.</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-indigo-100 uppercase tracking-wide">Quick Tips</div>
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
          assigned_employees: initialAssigned,
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
            <Form className="space-y-8">
              <section className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Basic Information</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Task Title <span className="text-red-500">*</span></label>
                    <Field name="title" className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" placeholder="Enter task title..." />
                    <div className="text-red-500 text-sm mt-1"><ErrorMessage name="title" /></div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
                    <Field as="textarea" name="description" className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none" rows={4} placeholder="Describe the task details..." />
                    <div className="text-red-500 text-sm mt-1"><ErrorMessage name="description" /></div>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Scheduling & Timeline</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Start Date <span className="text-red-500">*</span></label>
                    <Field type="date" name="start_date_time" className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" />
                    <div className="text-red-500 text-sm mt-1"><ErrorMessage name="start_date_time" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">End Date <span className="text-red-500">*</span></label>
                    <Field type="date" name="end_date_time" className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" />
                    <div className="text-red-500 text-sm mt-1"><ErrorMessage name="end_date_time" /></div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Estimated Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Field name="estimated_time" className="w-full pl-10 border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" placeholder="e.g. 5h 30m" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Status</label>
                    <Field as="select" name="task_status" className="w-full border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200">
                      <option value={1}>Open</option>
                      <option value={2}>In Progress</option>
                      <option value={3}>Done</option>
                    </Field>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Assign Employees</h4>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Search and add team members to this task.</p>
                <AssignedEmployeesSelect
                  employees={employees}
                  value={values.assigned_employees}
                  onChange={(val) => setFieldValue('assigned_employees', val)}
                />
              </section>

              <section className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Actions</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Task...
                      </div>
                    ) : (
                      'Create Task'
                    )}
                  </button>
                  <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200">
                    Cancel
                  </button>
                </div>
              </section>
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
    let filteredEmployees = employees;
    if (query) {
      const q = query.toLowerCase();
      filteredEmployees = employees.filter((e) => {
        const name = (e.firstName ? `${e.firstName} ${e.lastName || ''}` : e.name || '').toLowerCase();
        const email = (e.email || '').toLowerCase();
        return name.includes(q) || email.includes(q) || String(e.id).includes(q);
      });
    }
    // Exclude already selected employees
    return filteredEmployees.filter((e) => !value.includes(e.id));
  }, [employees, query, value]);

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
          const emp = employees.find((e) => e.id === id) || { id, name: `Employee #${id}` };
          const label = (emp.first_name || emp.firstName) ? `${emp.first_name || emp.firstName} ${emp.last_name || emp.lastName || ''}`.trim() : emp.name || emp.email || `Employee #${id}`;
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
            const label = (e.first_name) ? `${e.first_name} ${e.last_name  || ''}`.trim() : e.name || e.email || `#${e.id}`;
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