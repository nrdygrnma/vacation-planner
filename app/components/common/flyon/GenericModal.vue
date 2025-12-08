<template>
  <button
    aria-controls="custom-backdrop-modal"
    aria-expanded="false"
    aria-haspopup="dialog"
    class="btn btn-primary"
    data-overlay="#custom-backdrop-modal"
    type="button"
  >
    Method 1
  </button>

  <!-- Method 1 -->

  <div
    id="custom-backdrop-modal"
    class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 overlay-backdrop-open:bg-primary/30 hidden"
    role="dialog"
    tabindex="-1"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Dialog Title</h3>
          <button
            aria-label="Close"
            class="btn btn-text btn-circle btn-sm absolute end-3 top-3"
            data-overlay="#custom-backdrop-modal"
            type="button"
          >
            <span class="icon-[tabler--x] size-4"></span>
          </button>
        </div>
        <div class="modal-body">
          This is some placeholder content to show the scrolling behavior for
          modals. Instead of repeating the text in the modal, we use an inline
          style to set a minimum height, thereby extending the length of the
          overall modal and demonstrating the overflow scrolling. When content
          becomes longer than the height of the viewport, scrolling will move
          the modal as needed.
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-soft btn-secondary"
            data-overlay="#custom-backdrop-modal"
            type="button"
          >
            Close
          </button>
          <button class="btn btn-primary" type="button">Save changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
