import { exec } from 'child_process'
import { getStorage } from 'firebase-admin/storage'

import admin = require('firebase-admin')

import serviceAccount = require('../secrets/serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: 'split-6ed94.firebasestorage.app',
})

const backupName = `backup-${new Date().toISOString()}.sql`
const backupPath = `backups/${backupName}`

exec(`pg_dump -U postgres -h localhost -d split -f ${backupPath}`, (err) => {
  if (err) {
    console.error('Failed to backup database', err)
    return
  }

  const bucket = getStorage().bucket()

  bucket
    .upload(backupPath, { destination: backupName })
    .then(() => {
      console.log('Upload complete')
    })
    .catch((e) => {
      console.error('Upload failed', e)
    })
})
