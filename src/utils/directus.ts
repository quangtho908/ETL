import * as fs from 'node:fs';
import * as FormData from 'form-data';
import axios from 'axios';

export async function directusUploadFile(file: string, folder: string) {
  const formData = new FormData();
  formData.append('folder', folder);
  const paths = file.split('/');
  formData.append(
    'title',
    `${new Date().toISOString()}${paths[paths.length - 1]}`,
  );
  formData.append('file', fs.createReadStream(file));
  return axios.post('http://localhost:8055/files', formData);
}
