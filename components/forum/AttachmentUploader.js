"use client";

export default function AttachmentUploader({
  existingAttachments = [],
  stagedAttachments = [],
  onFilesSelected,
  onRemoveExisting,
  onRemoveStaged,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#31424F]">
          Attach files or images
        </label>
        <input
          type="file"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            if (files.length) {
              onFilesSelected(files);
            }
            event.target.value = "";
          }}
          className="block w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 text-sm text-[#52606D] file:mr-4 file:rounded-xl file:border-0 file:bg-[#12212B] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </div>

      {existingAttachments.length ? (
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7B8794]">
            Existing attachments
          </p>
          <div className="mt-3 grid gap-3">
            {existingAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-2xl border border-[#E7EEF2] bg-[#F8FBFC] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#12212B]">
                    {attachment.file_name}
                  </p>
                  <p className="mt-1 text-xs text-[#7B8794]">
                    {attachment.is_image ? "Image" : "File"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveExisting(attachment.id)}
                  className="rounded-xl bg-[#FFF5F5] px-3 py-2 text-sm font-semibold text-[#B42318]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {stagedAttachments.filter((item) => !item.is_inline).length ? (
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#7B8794]">
            New attachments
          </p>
          <div className="mt-3 grid gap-3">
            {stagedAttachments
              .filter((item) => !item.is_inline)
              .map((attachment) => (
                <div
                  key={attachment.temp_id}
                  className="flex items-center justify-between rounded-2xl border border-[#E7EEF2] bg-[#F8FBFC] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#12212B]">
                      {attachment.file_name}
                    </p>
                    <p className="mt-1 text-xs text-[#7B8794]">
                      {attachment.is_image ? "Image" : "File"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveStaged(attachment.temp_id)}
                    className="rounded-xl bg-[#FFF5F5] px-3 py-2 text-sm font-semibold text-[#B42318]"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}