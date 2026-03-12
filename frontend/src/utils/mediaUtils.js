// video permission
export const videoPermission = async () => {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: true });
    s.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
};

// audio permoission
export const audioPermission = async () => {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
};

// Screen-share Permission
export const screenPermission = async () => {
  !!navigator.mediaDevices.getDisplayMedia
};
