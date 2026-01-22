import { notFound } from "next/navigation";
import { getUploadLinkByToken } from "@/app/actions/upload-links";
import { GuidedCaptureWizard } from "./wizard-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function CustomerUploadPage({ params }: PageProps) {
  const { token } = await params;
  const { link, error } = await getUploadLinkByToken(token);

  if (error || !link) {
    notFound();
  }

  const contractor = link.contractors as { business_name: string | null; logo_url: string | null };
  const businessName = contractor?.business_name || "Your Contractor";
  const logoUrl = contractor?.logo_url || null;

  return (
    <GuidedCaptureWizard
      token={token}
      contractorId={link.contractor_id}
      uploadLinkId={link.id}
      businessName={businessName}
      logoUrl={logoUrl}
      linkLabel={link.label}
    />
  );
}
