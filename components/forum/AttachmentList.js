export default function AttachmentList({ attachments = [] }) {
  if (!attachments.length) {
    return null;
  }

  const imageAttachments = attachments.filter((item) => item.is_image);
  const fileAttachments = attachments.filter((item) => !item.is_image);

  return (
    <section className="mt-8 space-y-6">
      {imageAttachments.length ? (
        <div>
          <h3 className="text-xl font-black text-[#12212B]">Images</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {imageAttachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.public_url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-[20px] border border-[#D7E1E8] bg-[#F8FBFC]"
              >
                <img
                  src={attachment.public_url}
                  alt={attachment.file_name}
                  className="h-[220px] w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {fileAttachments.length ? (
        <div>
          <h3 className="text-xl font-black text-[#12212B]">Files</h3>
          <div className="mt-4 grid gap-3">
            {fileAttachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.public_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[20px] border border-[#D7E1E8] bg-[#F8FBFC] px-4 py-4 text-sm font-semibold text-[#12212B] hover:bg-white"
              >
                {attachment.file_name}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}