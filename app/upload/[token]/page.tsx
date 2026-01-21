import { notFound } from "next/navigation";
import { getUploadLinkByToken } from "@/app/actions/upload-links";
import { CustomerUploadClient } from "./upload-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function CustomerUploadPage({ params }: PageProps) {
  const { token } = await params;
  const { link, error } = await getUploadLinkByToken(token);

  if (error || !link) {
    notFound();
  }

  const businessName =
    (link.contractors as { business_name: string | null })?.business_name ||
    "Your Contractor";

  return (
    <CustomerUploadClient
      token={token}
      contractorId={link.contractor_id}
      uploadLinkId={link.id}
      businessName={businessName}
      linkLabel={link.label}
    />
  );
}
