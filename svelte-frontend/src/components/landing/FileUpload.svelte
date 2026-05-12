<script lang="ts">

  interface Props {
    onFileSelect: (file: File) => void;
    isUploading: boolean;
    uploadProgress?: number;
    processProgress?: number;
  }

  let { 
    onFileSelect, 
    isUploading, 
    uploadProgress = 0, 
    processProgress = 0 }: Props = $props();
  let isDragging = $state(false);
  let fileInput: HTMLInputElement;

  function handleDrag(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") isDragging=true;
    else if (event.type === "dragleave") isDragging=false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging=false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }
  

</script>

<button 
ondragenter={handleDrag}
ondragover={handleDrag}
ondragleave={handleDrag}
ondrop={handleDrop}
onclick={() => fileInput.click()}
class="w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
    {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
    {isUploading ? 'opacity-100 pointer-events-none' : ''}">
  <input
    type="file"
    bind:this={fileInput}
    class="hidden"
    accept=".csv"
    onchange={(e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onFileSelect(file);
    }}
  
  />
  <div class="space-y-4">
    <div class="text-4xl">📁</div>
    <p class="text-lg font-medium">
      {#if isUploading}
        {uploadProgress > 0 && `Uploading... ${uploadProgress}%`}
        {processProgress > 0 && `Processing... ${processProgress}%`}
        {uploadProgress === 0 && processProgress === 0 && 'Uploading and processing...'}
      {:else}
      Drag & drop your CSV here
      {/if}</p>
    <p class="text-sm text-gray-500">
      {#if !isUploading}
        or click to browse your computer
      {:else}
        Progress shown separately below
      {/if}</p>

    {#if isUploading || processProgress > 0}
    <div class="mt-4 space-y-3 text-left">
      <div>
        <div class="mb-1 text-xs font-semibold text-gray-600">Upload</div>
        <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-blue-600" style="width: {
                    Math.min(100, Math.max(0, uploadProgress))
                  }%"> </div>
        </div>
        <div class="mt-1 text-xs text-gray-500">{Math.round(uploadProgress)}%</div>
      </div>

      <div>
        <div class="mb-1 text-xs font-semibold text-gray-600">Processing</div>
        <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-600" style="width: {
                    Math.min(100, Math.max(0, processProgress))
                  }%" />
        </div>
        <div class="mt-1 text-xs text-gray-500">{Math.round(processProgress)}%</div>
      </div>
    </div>
    {/if}
  </div>
  
</button>