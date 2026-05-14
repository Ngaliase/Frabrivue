'use client';

import React, { useRef } from 'react';
import { ImagePlus, Type, Trash2, GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { PostBlock } from '@/types/fabric';
import { uploadImage } from '@/utils/api';
import styles from './BlockEditor.module.css';

interface BlockEditorProps {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
  disabled?: boolean;
}

export default function BlockEditor({ blocks, onChange, disabled }: BlockEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageIndex = useRef<number | null>(null);

  const addTextBlock = () => {
    onChange([...blocks, { type: 'text', content: '' }]);
  };

  const addImageBlock = (afterIndex?: number) => {
    pendingImageIndex.current = afterIndex ?? blocks.length;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const insertAt = pendingImageIndex.current ?? blocks.length;
    // Show preview immediately using blob URL
    const blobUrl = URL.createObjectURL(file);
    const newBlock: PostBlock = { type: 'image', url: blobUrl, caption: '' };
    const newBlocks = [...blocks];
    newBlocks.splice(insertAt, 0, newBlock);
    onChange(newBlocks);

    // Upload to Cloudinary in background
    try {
      const result = await uploadImage(file);
      // Replace blob URL with Cloudinary URL
      onChange(newBlocks.map((b, i) =>
        i === insertAt ? { ...b, url: result.url } : b
      ));
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const updateBlock = (index: number, patch: Partial<PostBlock>) => {
    onChange(blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const newBlocks = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className={styles.editor}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {blocks.length === 0 && (
        <div className={styles.empty}>
          <p>Bài viết trống. Thêm đoạn văn hoặc ảnh để bắt đầu.</p>
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={i} className={styles.blockWrap}>
          {/* Controls */}
          <div className={styles.controls}>
            <button type="button" className={styles.ctrlBtn} onClick={() => moveBlock(i, -1)} disabled={i === 0} title="Lên">
              <MoveUp size={13} />
            </button>
            <button type="button" className={styles.ctrlBtn} onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} title="Xuống">
              <MoveDown size={13} />
            </button>
            <button type="button" className={`${styles.ctrlBtn} ${styles.deleteCtrl}`} onClick={() => removeBlock(i)} title="Xóa">
              <Trash2 size={13} />
            </button>
          </div>

          {/* Block content */}
          {block.type === 'text' ? (
            <textarea
              className={styles.textBlock}
              placeholder="Nhập nội dung đoạn văn..."
              value={block.content || ''}
              onChange={e => updateBlock(i, { content: e.target.value })}
              rows={4}
              disabled={disabled}
            />
          ) : (
            <div className={styles.imageBlock}>
              {block.url ? (
                <div className={styles.imgPreview}>
                  <img src={block.url} alt="preview" />
                  <button
                    type="button"
                    className={styles.reuploadBtn}
                    onClick={() => addImageBlock(i)}
                    title="Đổi ảnh"
                  >
                    <ImagePlus size={14} /> Đổi ảnh
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.pickImageBtn} onClick={() => addImageBlock(i)}>
                  <ImagePlus size={20} />
                  <span>Chọn ảnh</span>
                </button>
              )}
              <input
                className={styles.captionInput}
                placeholder="Chú thích ảnh (tuỳ chọn)..."
                value={block.caption || ''}
                onChange={e => updateBlock(i, { caption: e.target.value })}
                disabled={disabled}
              />
            </div>
          )}

          {/* Divider + insert buttons */}
          <div className={styles.insertRow}>
            <button type="button" className={styles.insertBtn} onClick={addTextBlock} title="Thêm đoạn văn sau">
              <Type size={12} /> + Văn bản
            </button>
            <button type="button" className={styles.insertBtn} onClick={() => addImageBlock(i + 1)} title="Thêm ảnh sau">
              <ImagePlus size={12} /> + Ảnh
            </button>
          </div>
        </div>
      ))}

      {/* Toolbar at the bottom */}
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolBtn} onClick={addTextBlock} disabled={disabled}>
          <Type size={15} /> Thêm đoạn văn
        </button>
        <button type="button" className={styles.toolBtn} onClick={() => addImageBlock()} disabled={disabled}>
          <ImagePlus size={15} /> Thêm ảnh
        </button>
      </div>
    </div>
  );
}
