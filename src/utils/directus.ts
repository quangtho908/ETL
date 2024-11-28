import * as fs from 'node:fs';
import * as FormData from 'form-data';
import axios from 'axios';
import * as _ from 'lodash';

export async function directusUploadFile(file: string, folder: string) {
  const formData = new FormData();
  formData.append('folder', folder);
  formData.append('file', fs.createReadStream(file));
  return axios.post('http://localhost:8055/files', formData);
}

export async function directusCreateFolder(folder: string, name: string) {
  const response = await axios.post('http://localhost:8055/folders', {
    name,
    parent: folder,
  });

  return response.data.data.id;
}

export async function directusDeleteFile(file: string) {
  const response = await axios.get(
    `http://localhost:8055/files/?filter[filename_download][_eq]=${file}&filter[folder][_eq]=c461424e-297f-4b59-9806-68b414b09700`,
  );
  if (_.isEmpty(response?.data?.data)) return;
  await axios.delete(`http://localhost:8055/files/${response.data.data[0].id}`);
}
