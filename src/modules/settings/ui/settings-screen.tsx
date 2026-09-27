"use client";

import {
  DownloadIcon,
  HardDriveIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  UploadIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { InstallButton, useInstallState } from "@/platform/pwa";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useFlash } from "@/shared/hooks/use-flash";
import { formatJalali } from "@/shared/lib/date";
import { toPersianDigits } from "@/shared/lib/digits";
import { Button } from "@/shared/ui/button";
import { Card, CardTitle } from "@/shared/ui/card";
import { daysSince } from "../domain/backup";
import {
  InvalidBackupError,
  useBackupStatus,
  useExportBackup,
  useRestoreBackup,
  useStorageStatus,
} from "../hooks";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof HardDriveIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <CardTitle className="text-foreground flex items-center gap-2 text-base">
        <Icon className="text-primary size-5" />
        {title}
      </CardTitle>
      {children}
    </Card>
  );
}

function formatBytes(bytes: number) {
  const mb = bytes / 1024 / 1024;
  return mb < 1
    ? `${toPersianDigits(Math.max(1, Math.round(bytes / 1024)))} کیلوبایت`
    : `${toPersianDigits(mb.toFixed(1))} مگابایت`;
}

export function SettingsScreen() {
  const backup = useBackupStatus();
  const storage = useStorageStatus();
  const exportBackup = useExportBackup();
  const restore = useRestoreBackup();
  const install = useInstallState();
  const flash = useFlash();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);

  const lastBackupAt = backup.data?.lastBackupAt;

  async function runRestore() {
    if (!pickedFile) return;
    try {
      await restore.mutateAsync(pickedFile);
      flash.show("success", "اطلاعات از فایل پشتیبان بازگردانی شد");
    } catch (error) {
      flash.show(
        "danger",
        error instanceof InvalidBackupError
          ? "این فایل، فایل پشتیبان برنامه نیست"
          : "بازگردانی ناموفق بود",
      );
    } finally {
      setPickedFile(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section icon={DownloadIcon} title="پشتیبان‌گیری">
        <p className="text-muted-foreground">
          همه‌ی اطلاعات فقط روی همین دستگاه است. هر چند روز یک فایل پشتیبان بگیرید و آن را جای امنی
          (مثلاً تلگرام یا گوگل درایو) نگه دارید. با همین فایل می‌توانید اطلاعات را به گوشی یا
          کامپیوتر دیگری هم ببرید.
        </p>
        <p className="text-sm">
          آخرین پشتیبان:{" "}
          <span className="font-semibold">
            {lastBackupAt
              ? `${formatJalali(lastBackupAt, "EEEE d MMMM yyyy")} (${toPersianDigits(daysSince(lastBackupAt))} روز پیش)`
              : "هنوز گرفته نشده"}
          </span>
        </p>
        <Button
          size="lg"
          onClick={() =>
            exportBackup.mutate(undefined, {
              onSuccess: () => flash.show("success", "فایل پشتیبان دانلود شد"),
              onError: () => flash.show("danger", "ساختن فایل پشتیبان ناموفق بود"),
            })
          }
          disabled={exportBackup.isPending}
        >
          <DownloadIcon />
          دانلود فایل پشتیبان
        </Button>
      </Section>

      <Section icon={UploadIcon} title="بازگردانی از فایل پشتیبان">
        <p className="text-muted-foreground">
          اطلاعات فعلی این دستگاه <strong className="text-danger">کاملاً جایگزین</strong> اطلاعات
          داخل فایل می‌شود. قبلش از اطلاعات فعلی پشتیبان بگیرید.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept=".db,.sqlite,.sqlite3,application/octet-stream,application/vnd.sqlite3"
          className="hidden"
          onChange={(e) => setPickedFile(e.target.files?.[0] ?? null)}
        />
        <Button variant="secondary" size="lg" onClick={() => fileInput.current?.click()}>
          <UploadIcon />
          انتخاب فایل پشتیبان
        </Button>
        {pickedFile && (
          <ConfirmDialog
            title="بازگردانی اطلاعات؟"
            description={`همه‌ی اطلاعات فعلی با محتوای «${pickedFile.name}» جایگزین می‌شود. این کار برگشت‌پذیر نیست.`}
            confirmLabel="بازگردانی"
            onConfirm={runRestore}
            trigger={
              <Button size="lg" variant="danger" disabled={restore.isPending}>
                بازگردانی «{pickedFile.name}»
              </Button>
            }
          />
        )}
      </Section>

      <Section icon={HardDriveIcon} title="فضای ذخیره‌سازی">
        {storage.data?.persisted ? (
          <p className="text-success flex items-center gap-2">
            <ShieldCheckIcon className="size-5" />
            مرورگر اجازه‌ی نگهداری دائمی اطلاعات را داده است.
          </p>
        ) : (
          <p className="text-warning flex items-center gap-2">
            <ShieldAlertIcon className="size-5 shrink-0" />
            نگهداری دائمی هنوز تأیید نشده؛ برنامه را نصب کنید و پشتیبان بگیرید.
          </p>
        )}
        {storage.data?.usage != null && (
          <p className="text-muted-foreground text-sm">
            فضای استفاده‌شده: {formatBytes(storage.data.usage)}
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          اگر «داده‌های سایت» را در تنظیمات Chrome پاک کنید، اطلاعات برنامه هم پاک می‌شود.
        </p>
      </Section>

      <Section icon={SmartphoneIcon} title="نصب روی گوشی">
        {install === "installed" ? (
          <p className="text-success">برنامه روی این دستگاه نصب شده است.</p>
        ) : (
          <>
            <InstallButton />
            <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
              <li>برنامه را در Chrome گوشی باز کنید.</li>
              <li>منوی سه‌نقطه (⋮) بالای صفحه را بزنید.</li>
              <li>«نصب برنامه» یا «افزودن به صفحه‌ی اصلی» را انتخاب کنید.</li>
            </ol>
          </>
        )}
      </Section>

      {flash.element}
    </div>
  );
}
