import { createServer, Model, Factory, Response } from 'miragejs'

export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,
    models: {
      academicYear: Model,
      level: Model,
      filiere: Model,
      user: Model,
    },
    factories: {
      academicYear: Factory.extend({
        libelle(i) { return `202${i}-202${i+1}` },
        date_debut() { return '2024-10-01' },
        date_fin() { return '2025-07-01' },
        is_active() { return false },
      }),
      level: Factory.extend({
        code(i) { return ['L1','L2','L3','M1','M2'][i%5] },
        libelle(i) { return `Niveau ${i+1}` },
        ordre(i) { return i+1 },
      }),
      filiere: Factory.extend({
        code(i) { return ['GL','RT','GC','GE'][i%4] },
        libelle(i) { return `Filière ${i+1}` },
        description() { return '' },
      }),
    },
    seeds(server) {
      server.createList('academicYear', 3)
      server.createList('level', 5)
      server.createList('filiere', 4)
    },
    routes() {
      this.namespace = 'api/etablissement'
      // Années académiques
      this.get('/anneeacademiques/', (schema) => schema.academicYears.all().models)
      this.post('/anneeacademiques/', (schema, request) => {
        let attrs = JSON.parse(request.requestBody)
        attrs.id = Math.random().toString(36).slice(2)
        return schema.academicYears.create(attrs)
      })
      this.put('/anneeacademiques/:id', (schema, request) => {
        let attrs = JSON.parse(request.requestBody)
        let year = schema.academicYears.find(request.params.id)
        return year.update(attrs)
      })
      this.delete('/anneeacademiques/:id', (schema, request) => {
        let year = schema.academicYears.find(request.params.id)
        year.destroy()
        return new Response(204)
      })
      // Niveaux
      this.get('/niveaus/', (schema) => schema.levels.all().models)
      this.post('/niveaus/', (schema, request) => {
        let attrs = JSON.parse(request.requestBody)
        attrs.id = Math.random().toString(36).slice(2)
        return schema.levels.create(attrs)
      })
      this.put('/niveaus/:id', (schema, request) => {
        let attrs = JSON.parse(request.requestBody)
        let level = schema.levels.find(request.params.id)
        return level.update(attrs)
      })
      this.delete('/niveaus/:id', (schema, request) => {
        let level = schema.levels.find(request.params.id)
        level.destroy()
        return new Response(204)
      })
      // Filières
      this.get('/filieres/', (schema) => schema.filieres.all().models)
      this.post('/filieres/', (schema, request) => {
        let attrs = JSON.parse(request.requestBody)
        attrs.id = Math.random().toString(36).slice(2)
        return schema.filieres.create(attrs)
      })
      this.put('/filieres/:id', (schema, request) => {
        let attrs = JSON.parse(request.requestBody)
        let filiere = schema.filieres.find(request.params.id)
        return filiere.update(attrs)
      })
      this.delete('/filieres/:id', (schema, request) => {
        let filiere = schema.filieres.find(request.params.id)
        filiere.destroy()
        return new Response(204)
      })
      // Import CSV
      this.post('/users/import-csv', () => new Response(200, {}, { message: 'Import mock réussi' }))
    },
  })
}
