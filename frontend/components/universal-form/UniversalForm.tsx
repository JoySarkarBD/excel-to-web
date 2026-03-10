import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  DefaultValues,
  FieldErrors,
  FieldValues,
  FormProvider,
  useForm,
} from "react-hook-form";
import { ZodType } from "zod";
import { Calendar } from "../ui/calendar";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { UniversalFomrsProps } from "./form.types";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

export default function UniversalForm<T extends FieldValues>({
  title,
  fields,
  schema,
  defaultValues,
  onSubmit,
  submitText,
  setOpen,
}: UniversalFomrsProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema as ZodType<T, any, any>),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const { handleSubmit, control, formState } = methods;
  const [datePickerOpen, setDatePickerOpen] = useState<Record<string, boolean>>({});
  const [calendarMonth, setCalendarMonth] = useState<Record<string, Date | undefined>>({});

  const openDatePicker = (name: string, open: boolean) =>
    setDatePickerOpen((prev) => ({ ...prev, [name]: open }));

  const setFieldCalendarMonth = (name: string, month: Date | undefined) =>
    setCalendarMonth((prev) => ({ ...prev, [name]: month }));

  // State for file previews and drag state
  const [filePreviews, setFilePreviews] = useState<Record<string, string[]>>(
    {},
  );
  const [isDragging, setIsDragging] = useState<Record<string, boolean>>({});

  function isValidDate(date: Date | undefined) {
    if (!date) {
      return false;
    }
    return !isNaN(date.getTime());
  }

  function formatDate(date: Date | undefined) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const handleFileChange = (
    fieldName: string,
    files: FileList | null,
    multiple: boolean | undefined,
    onChange: (value: string | FileList | null | File) => void,
  ) => {
    if (!files) return;
    onChange(multiple ? files : files[0]);

    // Generate previews for images
    const previews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        previews.push(url);
      }
    }
    setFilePreviews((prev) => ({ ...prev, [fieldName]: previews }));
  };

  const handleFileDrop = (
    e: React.DragEvent<HTMLDivElement>,
    fieldName: string,
    multiple: boolean | undefined,
    onChange: (value: string | FileList | null | File) => void,
  ) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [fieldName]: false }));
    handleFileChange(fieldName, e.dataTransfer.files, multiple, onChange);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    fieldName: string,
  ) => {
    e.preventDefault();
    setIsDragging((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleDragLeave = (fieldName: string) => {
    setIsDragging((prev) => ({ ...prev, [fieldName]: false }));
  };

  const removeFilePreview = (
    fieldName: string,
    index: number,
    currentValue: string | FileList | null | File,
    multiple: boolean | undefined,
    onChange: (value: string | FileList | null | File) => void,
  ) => {
    // Remove preview
    setFilePreviews((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName]?.filter((_, i) => i !== index) || [],
    }));

    if (multiple) {
      const dt = new DataTransfer();
      const files = currentValue as FileList;
      for (let i = 0; i < files.length; i++) {
        if (i !== index) dt.items.add(files[i]);
      }
      onChange(dt.files.length > 0 ? dt.files : null);
    } else {
      onChange(null);
    }
  };

  // Scroll to and focus the first errored field (in form order)
  const handleError = (errors: FieldErrors<T>) => {
    const firstErrorField = fields.find((f) => errors[f.name]);
    if (firstErrorField) {
      const el = document.getElementById(String(firstErrorField.name));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = el.querySelector<HTMLElement>(
          "input:not([type='hidden']), textarea, select, button",
        );
        focusable?.focus();
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, handleError)}
        className="space-y-6 bg-white px-6 pb-4 dark:bg-gray-800"
      >
        <div className="flex justify-between">
          <h2 className="text-primary pb-2 text-2xl font-semibold">{title}</h2>
          {/* <AlertDialogCancel className="border-none p-0 shadow-none hover:bg-transparent hover:text-black dark:hover:text-white">
            <X />
          </AlertDialogCancel> */}
        </div>

        {fields.map((field) => (
          <div key={field.name} id={String(field.name)} className="flex flex-col">
            {/* Label */}
            {field.type !== "checkbox" &&
              field.type !== "switch" &&
              field.type !== "radio" && (
                <label className="text-foreground mb-4 text-xl font-medium">
                  {field.label}
                  {field.required ? (
                    <span className="text-red-500"> *</span>
                  ) : (
                    ""
                  )}
                </label>
              )}

            {/* Text, Email, Password, Number, Date */}
            {(field.type === "text" ||
              field.type === "email" ||
              field.type === "password" ||
              field.type === "number") && (
              <Input
                type={field.type}
                placeholder={field.placeholder}
                {...methods.register(field.name)} // remove any ---
                className={`border-input-border rounded-none border px-3 py-6 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${formState.errors[field.name] ? "border-red-500 border-2" : ""}`}
              />
            )}

            {/* Textarea */}
            {field.type === "textarea" && (
              <textarea
                placeholder={field.placeholder}
                {...methods.register(field.name)}
                className={`border-input-border h-25 rounded border px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${formState.errors[field.name] ? "border-red-500 border-2" : ""}`}
              />
            )}

            {/* Select */}
            {field.type === "select" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: controllerField }) => (
                  <select
                    {...controllerField}
                    className={`border-input-border rounded border px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${formState.errors[field.name] ? "border-red-500 border-2" : ""}`}
                  >
                    <option value="" disabled>
                      {field.placeholder || "Select an option"}
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}

            {/* Radio */}
            {field.type === "radio" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: controllerField }) => (
                  <div className="flex gap-4">
                    {field.options?.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Input
                          type="radio"
                          value={opt.value}
                          checked={controllerField.value === opt.value}
                          onChange={() => controllerField.onChange(opt.value)}
                          className="accent-primary"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                )}
              />
            )}

            {/* Checkbox */}
            {field.type === "checkbox" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: controllerField }) => (
                  <label className="flex cursor-pointer items-center gap-2">
                    <Input
                      type="checkbox"
                      checked={controllerField.value || false}
                      onChange={(e) =>
                        controllerField.onChange(e.target.checked)
                      }
                      className="accent-primary size-4"
                    />
                    {field.label}
                  </label>
                )}
              />
            )}

            {/* Switch */}
            {field.type === "switch" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: controllerField }) => (
                  <label className="flex cursor-pointer items-center gap-2">
                    <div
                      onClick={() =>
                        controllerField.onChange(!controllerField.value)
                      }
                      className={`flex h-5 w-10 items-center rounded-full p-1 transition-colors ${
                        controllerField.value
                          ? "bg-primary justify-end"
                          : "justify-start bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div className="h-4 w-4 rounded-full bg-white shadow" />
                    </div>
                    {field.label}
                  </label>
                )}
              />
            )}

            {field.type === "date" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: controllerField }) => {
                  const selectedDate = controllerField.value
                    ? new Date(controllerField.value)
                    : undefined;

                  return (
                    <Field>
                      <InputGroup className={`border-input-border rounded-none border px-3 py-6 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${formState.errors[field.name] ? "border-red-500 border-2" : ""}`}>
                        <InputGroupInput
                          value={formatDate(selectedDate)}
                          placeholder={field.placeholder || "Select date"}
                          readOnly
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              openDatePicker(field.name, true);
                            }
                          }}
                        />

                        <InputGroupAddon align="inline-end">
                          <Popover
                            open={!!datePickerOpen[field.name]}
                            onOpenChange={(open) => openDatePicker(field.name, open)}
                          >
                            <PopoverTrigger asChild>
                              <InputGroupButton variant="ghost" size="icon-xs">
                                <CalendarIcon className="text-primary bg-transparent hover:bg-transparent" />
                              </InputGroupButton>
                            </PopoverTrigger>

                            <PopoverContent className="p-0" align="end">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                month={calendarMonth[field.name] ?? selectedDate}
                                onMonthChange={(month) => setFieldCalendarMonth(field.name, month)}
                                onSelect={(date) => {
                                  controllerField.onChange(
                                    date
                                      ? date.toISOString().split("T")[0]
                                      : "",
                                  );
                                  openDatePicker(field.name, false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                  );
                }}
              />
            )}

            {field.type === "file" && (
              <Controller
                control={control}
                name={field.name}
                render={({ field: controllerField }) => {
                  const fieldName = field.name;
                  const previews = filePreviews[fieldName] || [];
                  const dragging = isDragging[fieldName] || false;

                  return (
                    <>
                      <label>
                        <Input
                          type="file"
                          hidden
                          multiple={field.multiple}
                          onChange={(e) =>
                            handleFileChange(
                              fieldName,
                              e.target.files,
                              field.multiple,
                              controllerField.onChange,
                            )
                          }
                        />

                        <div
                          className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed text-center transition ${dragging ? "border-primary bg-primary/10" : "border-input-border dark:border-gray-600"}`}
                          onDrop={(e) =>
                            handleFileDrop(
                              e,
                              fieldName,
                              field.multiple,
                              controllerField.onChange,
                            )
                          }
                          onDragOver={(e) => handleDragOver(e, fieldName)}
                          onDragLeave={() => handleDragLeave(fieldName)}
                        >
                          {/* Icon */}
                          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                            <svg
                              className="text-primary h-6 w-6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 16v-8m0 0l-3 3m3-3l3 3M20 16.5A4.5 4.5 0 0015.5 12h-1.1"
                              />
                            </svg>
                          </div>

                          <p className="text-sm">
                            <span className="text-primary font-medium">
                              Click or Drag & Drop
                            </span>{" "}
                            files
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            (Max. File size: 25 MB)
                          </p>
                        </div>
                      </label>

                      {/* Previews */}
                      {previews.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                          {previews.map((src, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square w-full overflow-hidden rounded border"
                            >
                              <Image
                                width={200}
                                height={200}
                                src={src}
                                alt={`preview-${idx}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeFilePreview(
                                    fieldName,
                                    idx,
                                    controllerField.value,
                                    field.multiple,
                                    controllerField.onChange,
                                  )
                                }
                                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                }}
              />
            )}

            {/* Error Message */}
            {formState.errors[field.name] && (
              <p className="mt-1 text-sm text-red-500">
                {formState.errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* Submit Button */}

        <div className="flex gap-4">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            className="border-destructive cursor-pointer rounded-none border bg-[#FFDDDD] py-4.75 text-[#DC3545] hover:bg-[#FFDDDD] hover:text-[#DC3545]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="bg-primary border-primary cursor-pointer rounded-none border py-4.75 text-white"
          >
            {formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submitText ? `${submitText}...` : "Submitting..."}
              </>
            ) : (
              submitText || "Submit"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
