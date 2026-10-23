import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  Clock,
  Phone,
  Filter,
  Eye,
  RefreshCw,
  Activity,
  FileText,
  Volume2,
  Stethoscope,
  Pill,
  Tv,
  ArrowRight,
  Plus,
  Send,
  AlertTriangle,
  Building2,
  Printer,
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import {
  POLI_LIST,
  getSimpusState,
  updateQueueStatus,
  saveNewEhrRecord,
  updatePharmacyStock,
  respondToPmoReport
} from '../services/puskesmasState';
import { announceQueueCall, playHospitalChime } from '../services/soundEffects';
import PrintResumeModal from './PrintResumeModal';

export default function OfficerView({
  onOpenNewPatient,
  onOpenWhatsAppSim,
  onOpenTvQueue
}) {
  const [activeTab, setActiveTab] = useState('antrean_poli'); // 'antrean_poli', 'input_ehr', 'data_pasien', 'farmasi', 'laporan_pmo'
  const [simpusState, setSimpusState] = useState(getSimpusState());
  const [filterPoli, setFilterPoli] = useState('all');
  const [patientSearch, setPatientSearch] = useState('');
  const [medSearch, setMedSearch] = useState('');
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form EHR State
  const [ehrQueueId, setEhrQueueId] = useState('');
  const [ehrPatientName, setEhrPatientName] = useState('Dika Pratama');
  const [ehrNik, setEhrNik] = useState('3201123456780001');
  const [ehrNoRm, setEhrNoRm] = useState('RM-2026-0814');
  const [ehrPoliId, setEhrPoliId] = useState('poli_tb');
  const [ehrDoctor, setEhrDoctor] = useState('dr. Sarah Anindita, Sp.KKLP');
  const [ehrAnamnesis, setEhrAnamnesis] = useState('Evaluasi respons pengobatan TB hari ke-12. Batuk reda, mual ringan pasca minum obat.');
  const [ehrAllergies, setEhrAllergies] = useState('Tidak ada alergi obat');
  const [ehrSystolic, setEhrSystolic] = useState(118);
  const [ehrDiastolic, setEhrDiastolic] = useState(76);
  const [ehrHeartRate, setEhrHeartRate] = useState(78);
  const [ehrTemp, setEhrTemp] = useState(36.7);
  const [ehrRR, setEhrRR] = useState(18);
  const [ehrWeight, setEhrWeight] = useState(56);
  const [ehrHeight, setEhrHeight] = useState(168);
  const [ehrIcd10, setEhrIcd10] = useState('A15.0 - Tuberkulosis Paru Terkonfirmasi Bakteriologis');
  const [ehrSecondaryIcd10, setEhrSecondaryIcd10] = useState('K29.7 - Gastritis Fungsional Ringan');
  const [ehrClinicalNotes, setEhrClinicalNotes] = useState('Lanjutkan 4KDT 3 tablet/hari. Jika mual, minum dengan pisang atau biskuit.');
  const [ehrPrescriptions, setEhrPrescriptions] = useState([
    {
      medicineName: 'Paket OAT 4KDT Kategori 1 (FDC Intensif)',
      dosage: '3 Tablet sekali minum',
      frequency: '1x sehari pagi (perut kosong)',
      quantity: 30,
      instructions: 'Minum jam 08:00 WIB'
    },
    {
      medicineName: 'Vitamin B6 (Piridoksin HCl) 10 mg',
      dosage: '1 Tablet',
      frequency: '1x sehari',
      quantity: 30,
      instructions: 'Pencegahan neuropati'
    }
  ]);

  // Restock modal state
  const [selectedMedRestock, setSelectedMedRestock] = useState(null);
  const [restockQty, setRestockQty] = useState(50);

  // PMO Response reply state
  const [respondingReportId, setRespondingReportId] = useState(null);
  const [doctorResponseText, setDoctorResponseText] = useState('');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // State synchronization
  useEffect(() => {
    const handleStateChange = () => {
      setSimpusState(getSimpusState());
    };
    window.addEventListener('simpus-state-changed', handleStateChange);
    return () => window.removeEventListener('simpus-state-changed', handleStateChange);
  }, []);

  // Compute stats
  const totalPasienHariIni = 84 + simpusState.queues.length;
  const antreanMenunggu = simpusState.queues.filter((q) => q.status === 'menunggu').length;
  const antreanSedangDiperiksa = simpusState.queues.filter(
    (q) => q.status === 'dipanggil' || q.status === 'sedang_diperiksa'
  ).length;
  const antreanSelesai = simpusState.queues.filter(
    (q) => q.status === 'selesai' || q.status === 'farmasi'
  ).length;
  const laporanPmoPending = simpusState.adverseReports.filter(
    (r) => r.status === 'menunggu_tanggapan'
  ).length;

  // Filter queues
  const filteredQueues = simpusState.queues.filter((q) => {
    if (filterPoli !== 'all' && q.poliId !== filterPoli) return false;
    return true;
  });

  // Handle Calling Queue
  const handleCallQueue = async (queue) => {
    updateQueueStatus(queue.id, 'dipanggil');
    triggerToast(`Memanggil pasien antrean ${queue.queueNumber}...`);
    await announceQueueCall(queue.queueNumber, queue.poliName, 'Ruang Pemeriksaan');
  };

  // Handle Begin Exam (Open in EHR)
  const handleBeginExam = (queue) => {
    updateQueueStatus(queue.id, 'sedang_diperiksa');
    setEhrQueueId(queue.id);
    setEhrPatientName(queue.patientName);
    setEhrNik(queue.nik || '3201123456780001');
    setEhrPoliId(queue.poliId);
    setEhrAnamnesis(`Keluhan pasien saat pendaftaran: ${queue.complaint}`);
    setActiveTab('input_ehr');
    triggerToast(`Pasien ${queue.patientName} (${queue.queueNumber}) dimuat ke form RME.`);
  };

  // Handle Mark Done
  const handleFinishQueue = (queueId) => {
    updateQueueStatus(queueId, 'selesai');
    triggerToast('Pemeriksaan selesai. Status antrean diperbarui.');
  };

  // Calculate BMI
  const calcBmi = () => {
    if (!ehrWeight || !ehrHeight) return { bmi: '-', cat: '-' };
    const hM = ehrHeight / 100;
    const val = (ehrWeight / (hM * hM)).toFixed(1);
    let cat = 'Normal';
    if (val < 18.5) cat = 'Berat Badan Kurang';
    else if (val >= 23 && val < 25) cat = 'Kelebihan BB Ringan';
    else if (val >= 25) cat = 'Obesitas';
    return { bmi: val, cat };
  };

  const currentBmi = calcBmi();

  // Add Prescription Item to EHR
  const handleAddRxItem = () => {
    setEhrPrescriptions([
      ...ehrPrescriptions,
      {
        medicineName: 'Paracetamol 500 mg',
        dosage: '1 Kaplet',
        frequency: '3x sehari bila demam/nyeri',
        quantity: 10,
        instructions: 'Sesudah makan'
      }
    ]);
  };

  const handleRemoveRxItem = (index) => {
    setEhrPrescriptions(ehrPrescriptions.filter((_, i) => i !== index));
  };

  // Save EHR
  const handleSaveEhr = (e) => {
    e.preventDefault();
    const poliObj = POLI_LIST.find((p) => p.id === ehrPoliId) || POLI_LIST[0];

    const saved = saveNewEhrRecord({
      queueId: ehrQueueId,
      patientName: ehrPatientName,
      nik: ehrNik,
      noRm: ehrNoRm,
      poliId: ehrPoliId,
      poliName: poliObj.name,
      doctorName: ehrDoctor,
      anamnesis: ehrAnamnesis,
      allergies: ehrAllergies,
      vitalSigns: {
        systolic: Number(ehrSystolic),
        diastolic: Number(ehrDiastolic),
        heartRate: Number(ehrHeartRate),
        respiratoryRate: Number(ehrRR),
        temperature: Number(ehrTemp),
        weight: Number(ehrWeight),
        height: Number(ehrHeight),
        bmi: currentBmi.bmi,
        bmiCategory: currentBmi.cat
      },
      primaryDiagnosis: ehrIcd10,
      secondaryDiagnosis: ehrSecondaryIcd10,
      clinicalNotes: ehrClinicalNotes,
      prescriptions: ehrPrescriptions
    });

    triggerToast('Rekam Medis Elektronik berhasil disimpan & resep diteruskan ke Farmasi!');
    setSelectedRecordForPrint(saved);
  };

  // Handle Restock Submit
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedMedRestock) return;
    updatePharmacyStock(selectedMedRestock.id, restockQty, 'add');
    triggerToast(`Berhasil menambah stok +${restockQty} unit untuk ${selectedMedRestock.name}`);
    setSelectedMedRestock(null);
  };

  // Handle Dispense Medicine
  const handleDispenseRx = (medId) => {
    updatePharmacyStock(medId, 10, 'subtract');
    triggerToast('Resep obat berhasil diserahkan ke pasien!');
  };

  // Handle Respond PMO Report
  const handleDoctorReplySubmit = (e) => {
    e.preventDefault();
    if (!respondingReportId || !doctorResponseText.trim()) return;

    respondToPmoReport(respondingReportId, doctorResponseText);
    triggerToast('Tanggapan dokter berhasil dikirim ke PMO dan notifikasi diperbarui.');
    setRespondingReportId(null);
    setDoctorResponseText('');
  };

  return (
    <div className="officer-portal-container">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="officer-floating-toast">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Clinic Stats Command Bar */}
      <section className="officer-stats-command-bar">
        <div className="stat-command-card bg-gradient-blue">
          <div className="stat-cmd-icon">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-cmd-val">{totalPasienHariIni}</div>
            <div className="stat-cmd-lbl">Total Pasien Terdaftar Hari Ini</div>
          </div>
        </div>

        <div className="stat-command-card bg-gradient-amber">
          <div className="stat-cmd-icon">
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-cmd-val">{antreanMenunggu} Pasien</div>
            <div className="stat-cmd-lbl">Antrean Aktif Menunggu</div>
          </div>
        </div>

        <div className="stat-command-card bg-gradient-teal">
          <div className="stat-cmd-icon">
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-cmd-val">{antreanSedangDiperiksa} Pasien</div>
            <div className="stat-cmd-lbl">Sedang Diperiksa / Dipanggil</div>
          </div>
        </div>

        <div className="stat-command-card bg-gradient-emerald">
          <div className="stat-cmd-icon">
            <Stethoscope size={24} />
          </div>
          <div>
            <div className="stat-cmd-val">5 Dokter</div>
            <div className="stat-cmd-lbl">Dokter & Nakes On-Duty</div>
          </div>
        </div>

        {laporanPmoPending > 0 && (
          <div
            className="stat-command-card bg-gradient-rose clickable"
            onClick={() => setActiveTab('laporan_pmo')}
            title="Klik untuk membuka laporan PMO"
          >
            <div className="stat-cmd-icon">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="stat-cmd-val">{laporanPmoPending} Laporan</div>
              <div className="stat-cmd-lbl">🚨 Kendala PMO Perlu Respon</div>
            </div>
          </div>
        )}
      </section>

      {/* Officer Navigation Tabs */}
      <nav className="officer-subnav-tabs">
        <button
          className={`officer-tab-btn ${activeTab === 'antrean_poli' ? 'active' : ''}`}
          onClick={() => setActiveTab('antrean_poli')}
        >
          <Volume2 size={16} />
          <span>1. Manajemen Antrean Poli (Panggil)</span>
          {antreanMenunggu > 0 && (
            <span className="tab-pill-badge">{antreanMenunggu}</span>
          )}
        </button>

        <button
          className={`officer-tab-btn ${activeTab === 'input_ehr' ? 'active' : ''}`}
          onClick={() => setActiveTab('input_ehr')}
        >
          <FileText size={16} />
          <span>2. Input & Edit RME (Rekam Medis)</span>
        </button>

        <button
          className={`officer-tab-btn ${activeTab === 'data_pasien' ? 'active' : ''}`}
          onClick={() => setActiveTab('data_pasien')}
        >
          <Users size={16} />
          <span>3. Manajemen Data Pasien</span>
        </button>

        <button
          className={`officer-tab-btn ${activeTab === 'farmasi' ? 'active' : ''}`}
          onClick={() => setActiveTab('farmasi')}
        >
          <Package size={16} />
          <span>4. Manajemen Farmasi & Stok Obat</span>
        </button>

        <button
          className={`officer-tab-btn ${activeTab === 'laporan_pmo' ? 'active' : ''}`}
          onClick={() => setActiveTab('laporan_pmo')}
        >
          <AlertCircle size={16} />
          <span>5. Respon Kendala Efek Samping PMO</span>
          {laporanPmoPending > 0 && (
            <span className="tab-pill-badge badge-danger">{laporanPmoPending}</span>
          )}
        </button>
      </nav>

      {/* ==============================================================
          TAB 1: MANAJEMEN ANTREAN POLI (PANGGIL PASIEN REALTIME)
          ============================================================== */}
      {activeTab === 'antrean_poli' && (
        <div className="officer-tab-content">
          <div className="queue-station-header">
            <div className="station-title-box">
              <h2 className="section-main-heading">Meja Panggilan Antrean Poliklinik</h2>
              <p className="section-sub-heading">
                Panggil pasien berikutnya menggunakan sistem nada panggil otomatis dan sintesis suara Bahasa Indonesia.
              </p>
            </div>

            <div className="station-actions-right">
              <button className="btn-tv-monitor-launcher" onClick={onOpenTvQueue}>
                <Tv size={16} />
                <span>Buka Layar Monitor Antrean TV (Ruang Tunggu)</span>
              </button>
            </div>
          </div>

          {/* Filter Pills per Poli */}
          <div className="poli-filter-pills-bar">
            <button
              className={`poli-filter-pill ${filterPoli === 'all' ? 'active' : ''}`}
              onClick={() => setFilterPoli('all')}
            >
              Semua Poli ({simpusState.queues.length})
            </button>
            {POLI_LIST.map((poli) => {
              const count = simpusState.queues.filter((q) => q.poliId === poli.id).length;
              return (
                <button
                  key={poli.id}
                  className={`poli-filter-pill ${filterPoli === 'poli.id' ? 'active' : ''}`}
                  onClick={() => setFilterPoli(poli.id)}
                >
                  {poli.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Queue Tickets Table / Cards */}
          <div className="simpus-card queue-table-card">
            <div className="queue-table-wrapper">
              <table className="officer-data-table">
                <thead>
                  <tr>
                    <th>No. Antrean</th>
                    <th>Nama Pasien & NIK</th>
                    <th>Poliklinik Tujuan</th>
                    <th>Penjamin</th>
                    <th>Keluhan Utama</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Aksi Panggilan Nakes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueues.map((q) => {
                    const isCalling = q.status === 'dipanggil';
                    const isExamining = q.status === 'sedang_diperiksa';
                    const isPharmacy = q.status === 'farmasi';
                    const isDone = q.status === 'selesai';

                    return (
                      <tr
                        key={q.id}
                        className={isCalling ? 'row-highlight-calling' : isExamining ? 'row-highlight-exam' : ''}
                      >
                        <td>
                          <span className="queue-badge-chip font-bold">{q.queueNumber}</span>
                          <div className="queue-reg-time">{q.registeredAt}</div>
                        </td>
                        <td>
                          <div className="patient-table-name font-bold">{q.patientName}</div>
                          <div className="patient-table-nik">NIK: {q.nik}</div>
                        </td>
                        <td>
                          <span className="table-poli-tag">{q.poliName}</span>
                          <div className="table-doc-sub">{q.doctor}</div>
                        </td>
                        <td>
                          <span className="table-payment-pill">{q.paymentType}</span>
                        </td>
                        <td>
                          <div className="table-complaint-text">{q.complaint}</div>
                        </td>
                        <td>
                          <span className={`table-status-pill status-${q.status}`}>
                            {q.status === 'menunggu' && 'Menunggu'}
                            {q.status === 'dipanggil' && 'Sedang Dipanggil'}
                            {q.status === 'sedang_diperiksa' && 'Sedang Diperiksa'}
                            {q.status === 'farmasi' && 'Di Farmasi'}
                            {q.status === 'selesai' && 'Selesai'}
                          </span>
                        </td>
                        <td>
                          <div className="queue-action-buttons-group">
                            {/* Call Button */}
                            <button
                              className="btn-call-patient"
                              onClick={() => handleCallQueue(q)}
                              title="Panggil Pasien (Speaker + Gong)"
                            >
                              <Volume2 size={15} />
                              <span>{isCalling ? 'Panggil Ulang' : 'Panggil'}</span>
                            </button>

                            {/* Open in EHR Form */}
                            <button
                              className="btn-open-ehr"
                              onClick={() => handleBeginExam(q)}
                              title="Mulai Pemeriksaan Medis (Input RME)"
                            >
                              <FileText size={15} />
                              <span>Buka RME</span>
                            </button>

                            {/* Finish Button */}
                            {!isDone && (
                              <button
                                className="btn-finish-queue"
                                onClick={() => handleFinishQueue(q.id)}
                                title="Tandai Selesai"
                              >
                                <CheckCircle2 size={15} />
                                <span>Selesai</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredQueues.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                        Tidak ada antrean terdaftar pada kategori poli ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: INPUT DAN EDIT REKAM MEDIS ELEKTRONIK (RME / EHR)
          ============================================================== */}
      {activeTab === 'input_ehr' && (
        <div className="officer-tab-content">
          <div className="ehr-entry-header">
            <div>
              <h2 className="section-main-heading">Input Rekam Medis Elektronik (RME)</h2>
              <p className="section-sub-heading">
                Standar Kemenkes RI • Penegakan Diagnosis ICD-10, Pemeriksaan Fisik & E-Resep Farmasi Terpadu.
              </p>
            </div>

            <div className="ehr-quick-meta-box">
              <span className="meta-tag-blue">Pasien: {ehrPatientName}</span>
              <span className="meta-tag-gray">No. RM: {ehrNoRm}</span>
            </div>
          </div>

          <form onSubmit={handleSaveEhr} className="ehr-full-clinical-form">
            {/* Section 1: Data Identitas & Poli */}
            <div className="simpus-card ehr-section-card">
              <h3 className="ehr-block-title">
                <Users size={18} className="text-primary" /> I. Data Identitas & Poliklinik
              </h3>
              <div className="form-grid-3">
                <div className="form-item-wrap">
                  <label className="form-field-lbl">Nama Pasien</label>
                  <input
                    type="text"
                    className="custom-form-ctrl font-bold"
                    value={ehrPatientName}
                    onChange={(e) => setEhrPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-item-wrap">
                  <label className="form-field-lbl">NIK (KTP)</label>
                  <input
                    type="text"
                    className="custom-form-ctrl"
                    value={ehrNik}
                    onChange={(e) => setEhrNik(e.target.value)}
                  />
                </div>
                <div className="form-item-wrap">
                  <label className="form-field-lbl">Poli Pemeriksaan</label>
                  <select
                    className="custom-form-ctrl"
                    value={ehrPoliId}
                    onChange={(e) => setEhrPoliId(e.target.value)}
                  >
                    {POLI_LIST.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.room})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Anamnesis & Alergi */}
            <div className="simpus-card ehr-section-card">
              <h3 className="ehr-block-title">
                <Activity size={18} className="text-teal" /> II. Anamnesis & Keluhan Utama
              </h3>
              <div className="form-grid-2">
                <div className="form-item-wrap">
                  <label className="form-field-lbl">Keluhan Utama & Riwayat Penyakit Sekarang (RPS)</label>
                  <textarea
                    rows="3"
                    className="custom-form-ctrl"
                    value={ehrAnamnesis}
                    onChange={(e) => setEhrAnamnesis(e.target.value)}
                    placeholder="Contoh: Batuk berdahak 3 minggu, demam malam hari, lemas..."
                    required
                  />
                </div>
                <div className="form-item-wrap">
                  <label className="form-field-lbl">Riwayat Alergi Obat / Makanan</label>
                  <textarea
                    rows="3"
                    className="custom-form-ctrl"
                    value={ehrAllergies}
                    onChange={(e) => setEhrAllergies(e.target.value)}
                    placeholder="Contoh: Tidak ada riwayat alergi obat, atau Alergi Amoxicillin..."
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Tanda-Tanda Vital & Antropometri */}
            <div className="simpus-card ehr-section-card">
              <div className="vitals-header-with-bmi">
                <h3 className="ehr-block-title">
                  <HeartPulse size={18} className="text-rose-500" /> III. Pemeriksaan Tanda-Tanda Vital & Status Gizi
                </h3>
                <div className="bmi-live-badge">
                  <span>IMT Terhitung:</span>
                  <strong className="bmi-val-num">{currentBmi.bmi} kg/m²</strong>
                  <span className="bmi-cat-pill">({currentBmi.cat})</span>
                </div>
              </div>

              <div className="vitals-inputs-grid-6">
                <div className="form-item-wrap">
                  <label className="form-field-lbl">Tekanan Darah (Sistolik)</label>
                  <div className="input-unit-wrap">
                    <input
                      type="number"
                      className="custom-form-ctrl"
                      value={ehrSystolic}
                      onChange={(e) => setEhrSystolic(e.target.value)}
                    />
                    <span className="unit-suffix">mmHg</span>
                  </div>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">Tekanan Darah (Diastolik)</label>
                  <div className="input-unit-wrap">
                    <input
                      type="number"
                      className="custom-form-ctrl"
                      value={ehrDiastolic}
                      onChange={(e) => setEhrDiastolic(e.target.value)}
                    />
                    <span className="unit-suffix">mmHg</span>
                  </div>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">Denyut Nadi</label>
                  <div className="input-unit-wrap">
                    <input
                      type="number"
                      className="custom-form-ctrl"
                      value={ehrHeartRate}
                      onChange={(e) => setEhrHeartRate(e.target.value)}
                    />
                    <span className="unit-suffix">x/mnt</span>
                  </div>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">Suhu Tubuh</label>
                  <div className="input-unit-wrap">
                    <input
                      type="number"
                      step="0.1"
                      className="custom-form-ctrl"
                      value={ehrTemp}
                      onChange={(e) => setEhrTemp(e.target.value)}
                    />
                    <span className="unit-suffix">°C</span>
                  </div>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">Berat Badan (BB)</label>
                  <div className="input-unit-wrap">
                    <input
                      type="number"
                      step="0.5"
                      className="custom-form-ctrl"
                      value={ehrWeight}
                      onChange={(e) => setEhrWeight(e.target.value)}
                    />
                    <span className="unit-suffix">kg</span>
                  </div>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">Tinggi Badan (TB)</label>
                  <div className="input-unit-wrap">
                    <input
                      type="number"
                      className="custom-form-ctrl"
                      value={ehrHeight}
                      onChange={(e) => setEhrHeight(e.target.value)}
                    />
                    <span className="unit-suffix">cm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Diagnosis ICD-10 */}
            <div className="simpus-card ehr-section-card">
              <h3 className="ehr-block-title">
                <FileText size={18} className="text-primary" /> IV. Penegakan Diagnosis (ICD-10)
              </h3>
              <div className="form-grid-2">
                <div className="form-item-wrap">
                  <label className="form-field-lbl">Diagnosis Primer (ICD-10 Utama)</label>
                  <select
                    className="custom-form-ctrl font-bold"
                    value={ehrIcd10}
                    onChange={(e) => setEhrIcd10(e.target.value)}
                  >
                    <option value="A15.0 - Tuberkulosis Paru Terkonfirmasi Bakteriologis">
                      A15.0 - Tuberkulosis Paru Terkonfirmasi Bakteriologis (BTA +)
                    </option>
                    <option value="A16.2 - Tuberkulosis Paru Klinis Tanpa Konfirmasi Bakteriologis">
                      A16.2 - Tuberkulosis Paru Klinis
                    </option>
                    <option value="I10 - Hipertensi Esensial (Primer)">
                      I10 - Hipertensi Esensial (Primer)
                    </option>
                    <option value="E11.9 - Diabetes Melitus Tipe 2 Tanpa Komplikasi">
                      E11.9 - Diabetes Melitus Tipe 2 Tanpa Komplikasi
                    </option>
                    <option value="J00 - Nasofaringitis Akut (Common Cold / ISPA)">
                      J00 - Nasofaringitis Akut (Common Cold / ISPA)
                    </option>
                    <option value="K29.7 - Gastritis Fungsional Ringan">
                      K29.7 - Gastritis Fungsional Ringan
                    </option>
                    <option value="K02.1 - Caries of Dentine (Gigi Berlubang)">
                      K02.1 - Caries of Dentine (Gigi Berlubang)
                    </option>
                    <option value="L20 - Dermatitis Atopik / Alergi Kulit">
                      L20 - Dermatitis Atopik / Alergi Kulit
                    </option>
                  </select>
                </div>

                <div className="form-item-wrap">
                  <label className="form-field-lbl">Diagnosis Sekunder (Komorbid / Gejala Penyerta)</label>
                  <input
                    type="text"
                    className="custom-form-ctrl"
                    value={ehrSecondaryIcd10}
                    onChange={(e) => setEhrSecondaryIcd10(e.target.value)}
                    placeholder="Contoh: K29.7 Gastritis imbas OAT, atau Anemia..."
                  />
                </div>
              </div>

              <div className="form-item-wrap" style={{ marginTop: '14px' }}>
                <label className="form-field-lbl">Catatan Klinis & Rencana Terapi (Plan)</label>
                <textarea
                  rows="2"
                  className="custom-form-ctrl"
                  value={ehrClinicalNotes}
                  onChange={(e) => setEhrClinicalNotes(e.target.value)}
                  placeholder="Catatan edukasi, etika batuk, pendampingan PMO..."
                />
              </div>
            </div>

            {/* Section 5: E-Resep Farmasi (E-Prescription) */}
            <div className="simpus-card ehr-section-card">
              <div className="rx-builder-header">
                <h3 className="ehr-block-title">
                  <Pill size={18} className="text-emerald" /> V. Resep Obat Elektronik (E-Prescription)
                </h3>
                <button
                  type="button"
                  className="btn-add-rx-row"
                  onClick={handleAddRxItem}
                >
                  <Plus size={15} /> Tambah Obat Lain
                </button>
              </div>

              <div className="rx-items-builder-list">
                {ehrPrescriptions.map((rx, idx) => (
                  <div key={idx} className="rx-builder-row">
                    <div className="rx-row-index">{idx + 1}</div>
                    <div className="rx-field-med">
                      <label className="rx-sub-lbl">Nama Obat & Sediaan</label>
                      <input
                        type="text"
                        className="custom-form-ctrl font-bold"
                        value={rx.medicineName}
                        onChange={(e) => {
                          const updated = [...ehrPrescriptions];
                          updated[idx].medicineName = e.target.value;
                          setEhrPrescriptions(updated);
                        }}
                        required
                      />
                    </div>
                    <div className="rx-field-rule">
                      <label className="rx-sub-lbl">Aturan Pakai (Signa)</label>
                      <input
                        type="text"
                        className="custom-form-ctrl"
                        value={rx.frequency || rx.dosage}
                        onChange={(e) => {
                          const updated = [...ehrPrescriptions];
                          updated[idx].frequency = e.target.value;
                          setEhrPrescriptions(updated);
                        }}
                        placeholder="Contoh: 1x sehari pagi hari"
                        required
                      />
                    </div>
                    <div className="rx-field-qty">
                      <label className="rx-sub-lbl">Jumlah</label>
                      <input
                        type="number"
                        className="custom-form-ctrl"
                        value={rx.quantity}
                        onChange={(e) => {
                          const updated = [...ehrPrescriptions];
                          updated[idx].quantity = Number(e.target.value);
                          setEhrPrescriptions(updated);
                        }}
                        required
                      />
                    </div>
                    <div className="rx-field-inst">
                      <label className="rx-sub-lbl">Petunjuk Khusus</label>
                      <input
                        type="text"
                        className="custom-form-ctrl"
                        value={rx.instructions}
                        onChange={(e) => {
                          const updated = [...ehrPrescriptions];
                          updated[idx].instructions = e.target.value;
                          setEhrPrescriptions(updated);
                        }}
                        placeholder="Sebelum makan / sesudah makan"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-remove-rx-row"
                      onClick={() => handleRemoveRxItem(idx)}
                      title="Hapus baris obat"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Submit Footer */}
            <div className="ehr-submit-row-sticky">
              <div className="ehr-dpjp-indicator">
                <Stethoscope size={16} /> DPJP Pemeriksa: <strong>{ehrDoctor}</strong>
              </div>

              <div className="ehr-actions-group">
                {selectedRecordForPrint && (
                  <button
                    type="button"
                    className="btn-print-preview-ehr"
                    onClick={() => setIsPrintModalOpen(true)}
                  >
                    <Printer size={16} /> Lihat Resume Medis Resmi
                  </button>
                )}

                <button type="submit" className="btn-save-ehr-record">
                  <CheckCircle2 size={18} />
                  <span>Simpan Rekam Medis & Teruskan E-Resep ke Farmasi</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ==============================================================
          TAB 3: MANAJEMEN DATA PASIEN DAN RIWAYAT PENYAKIT
          ============================================================== */}
      {activeTab === 'data_pasien' && (
        <div className="officer-tab-content">
          <div className="queue-station-header">
            <div>
              <h2 className="section-main-heading">Master Direktori Data Pasien & Riwayat</h2>
              <p className="section-sub-heading">
                Kelola data pasien terdaftar di Puskesmas Mekar Jaya, riwayat kepesertaan BPJS, serta pemantauan penyakit kronis.
              </p>
            </div>

            <button className="btn-add-patient-primary" onClick={onOpenNewPatient}>
              <UserPlus size={16} />
              <span>+ Daftarkan Pasien Baru</span>
            </button>
          </div>

          <div className="simpus-card">
            {/* Search Bar */}
            <div className="patient-search-bar-row">
              <div className="search-input-pill">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pasien berdasarkan Nama, NIK, No. BPJS, atau Alamat..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
              <span className="search-count-tag">
                Menampilkan {simpusState.pmoPatients.length + 3} Pasien Terdaftar
              </span>
            </div>

            <div className="queue-table-wrapper">
              <table className="officer-data-table">
                <thead>
                  <tr>
                    <th>No. RM</th>
                    <th>Nama Pasien</th>
                    <th>NIK / Usia</th>
                    <th>Diagnosis / Program</th>
                    <th>Fase Pengobatan</th>
                    <th>Status Kepatuhan</th>
                    <th>Nama PMO</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {simpusState.pmoPatients
                    .filter((p) =>
                      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                      p.nik.includes(patientSearch)
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold text-primary">{p.noRm}</td>
                        <td>
                          <div className="font-bold">{p.name}</div>
                          <div className="text-muted text-xs">{p.address}</div>
                        </td>
                        <td>
                          <div>{p.nik}</div>
                          <div className="text-muted text-xs">{p.age} Tahun ({p.gender})</div>
                        </td>
                        <td>
                          <span className="table-poli-tag">{p.diagnosis}</span>
                        </td>
                        <td>
                          <div className="font-bold">{p.phase}</div>
                          <div className="text-muted text-xs">Hari {p.dayNumber} dari {p.totalDays}</div>
                        </td>
                        <td>
                          <span className="adherence-badge-pill">
                            {p.adherenceScore}% Patuh (Streak {p.streakDays} hr)
                          </span>
                        </td>
                        <td>
                          <div>{p.pmoName || 'Ibu Ratna'}</div>
                          <div className="text-muted text-xs">{p.phone}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-table-action-small"
                            onClick={() => {
                              setEhrPatientName(p.name);
                              setEhrNik(p.nik);
                              setEhrNoRm(p.noRm);
                              setActiveTab('input_ehr');
                            }}
                          >
                            <FileText size={13} /> Buka RME
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 4: MANAJEMEN FARMASI (STOK OBAT)
          ============================================================== */}
      {activeTab === 'farmasi' && (
        <div className="officer-tab-content">
          <div className="queue-station-header">
            <div>
              <h2 className="section-main-heading">Manajemen Farmasi & Gudang Obat Puskesmas</h2>
              <p className="section-sub-heading">
                Pantau ketersediaan stok obat esensial, paket OAT TB program nasional, peringatan stok menipis, dan penyerahan obat resep.
              </p>
            </div>

            <div className="farmasi-badges-summary">
              <span className="badge-stat green">
                {simpusState.pharmacyStock.filter((m) => m.status === 'aman').length} Stok Aman
              </span>
              <span className="badge-stat amber">
                {simpusState.pharmacyStock.filter((m) => m.status === 'menipis').length} Menipis
              </span>
              <span className="badge-stat red">
                {simpusState.pharmacyStock.filter((m) => m.status === 'kritis').length} Kritis / Habis
              </span>
            </div>
          </div>

          <div className="simpus-card">
            <div className="patient-search-bar-row">
              <div className="search-input-pill">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama obat, zat aktif, atau nomor batch..."
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="queue-table-wrapper">
              <table className="officer-data-table">
                <thead>
                  <tr>
                    <th>Nama Obat & Sediaan</th>
                    <th>Kategori Obat</th>
                    <th>Zat Aktif & Dosis</th>
                    <th>Stok Tersedia</th>
                    <th>Batas Minimal</th>
                    <th>Status Stok</th>
                    <th>Kadaluarsa (ED)</th>
                    <th style={{ textAlign: 'center' }}>Aksi Gudang</th>
                  </tr>
                </thead>
                <tbody>
                  {simpusState.pharmacyStock
                    .filter((m) =>
                      m.name.toLowerCase().includes(medSearch.toLowerCase()) ||
                      m.category.toLowerCase().includes(medSearch.toLowerCase())
                    )
                    .map((med) => (
                      <tr key={med.id}>
                        <td>
                          <div className="font-bold">{med.name}</div>
                          <div className="text-muted text-xs">{med.form} • Batch: {med.batchNo}</div>
                        </td>
                        <td>
                          <span className="table-poli-tag">{med.category}</span>
                        </td>
                        <td>
                          <div className="text-xs">{med.activeSubstance}</div>
                        </td>
                        <td>
                          <span className="med-stock-number font-bold">{med.stock}</span> {med.unit}
                        </td>
                        <td>
                          <span className="text-muted">{med.minStock} {med.unit}</span>
                        </td>
                        <td>
                          <span className={`stock-status-pill status-${med.status}`}>
                            {med.status === 'aman' && '✓ Aman'}
                            {med.status === 'menipis' && '⚠️ Menipis'}
                            {med.status === 'kritis' && '🚨 Kritis / Segera Pesan'}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs">{med.expiryDate}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="stock-btn-group">
                            <button
                              className="btn-restock-action"
                              onClick={() => setSelectedMedRestock(med)}
                              title="Tambah Stok Masuk"
                            >
                              <Plus size={13} /> Tambah
                            </button>
                            <button
                              className="btn-dispense-action"
                              onClick={() => handleDispenseRx(med.id)}
                              title="Serahkan Obat ke Pasien"
                            >
                              <Pill size={13} /> Serahkan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Restock Modal */}
          {selectedMedRestock && (
            <div className="simpus-modal-backdrop" onClick={() => setSelectedMedRestock(null)}>
              <div className="restock-dialog-box" onClick={(e) => e.stopPropagation()}>
                <h3 className="restock-modal-title">Tambah Stok Obat Masuk</h3>
                <p className="restock-modal-sub">
                  Obat: <strong>{selectedMedRestock.name}</strong> (Stok saat ini: {selectedMedRestock.stock} {selectedMedRestock.unit})
                </p>

                <form onSubmit={handleRestockSubmit}>
                  <div className="form-item-wrap" style={{ margin: '16px 0' }}>
                    <label className="form-field-lbl">Jumlah Tambahan Unit Masuk</label>
                    <input
                      type="number"
                      min="1"
                      className="custom-form-ctrl font-bold"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="restock-modal-actions">
                    <button
                      type="button"
                      className="btn-cancel-modal"
                      onClick={() => setSelectedMedRestock(null)}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn-confirm-restock">
                      Simpan Tambahan Stok
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          TAB 5: RESPON KENDALA EFEK SAMPING PMO
          ============================================================== */}
      {activeTab === 'laporan_pmo' && (
        <div className="officer-tab-content">
          <div className="queue-station-header">
            <div>
              <h2 className="section-main-heading">Pusat Respon Kendala & Efek Samping dari PMO</h2>
              <p className="section-sub-heading">
                Laporan darurat dari Pengawas Menelan Obat (PMO) terkait efek samping obat TB (misal mual berat, ruam, ikterus) atau pasien menolak minum obat.
              </p>
            </div>
          </div>

          <div className="pmo-reports-feed-grid">
            {simpusState.adverseReports.map((rep) => (
              <div
                key={rep.id}
                className={`pmo-report-card severity-${rep.severity}`}
              >
                <div className="report-card-top-bar">
                  <span className={`severity-tag severity-${rep.severity}`}>
                    URGENSI: {rep.severity.toUpperCase()}
                  </span>
                  <span className="report-time-stamp">{rep.reportedAt}</span>
                </div>

                <h3 className="report-headline">{rep.category}</h3>
                <div className="report-patient-meta">
                  <span>Pasien: <strong>{rep.patientName}</strong></span> • 
                  <span>Pelapor: <strong>{rep.pmoName}</strong></span>
                </div>

                <div className="report-body-text">
                  "{rep.description}"
                </div>

                {/* Doctor's Response Box */}
                {rep.doctorResponse ? (
                  <div className="doctor-reply-box">
                    <div className="reply-label">
                      <CheckCircle2 size={15} /> Tanggapan Medis Dokter Puskesmas:
                    </div>
                    <p className="reply-text">{rep.doctorResponse}</p>
                  </div>
                ) : (
                  <div className="reply-pending-action">
                    {respondingReportId === rep.id ? (
                      <form onSubmit={handleDoctorReplySubmit} className="doctor-reply-form">
                        <textarea
                          rows="3"
                          className="custom-form-ctrl"
                          placeholder="Ketik instruksi dokter untuk PMO/Pasien (misal: Rujuk ke poli hari ini, beri antihistamin, dsb)..."
                          value={doctorResponseText}
                          onChange={(e) => setDoctorResponseText(e.target.value)}
                          required
                        />
                        <div className="reply-form-actions">
                          <button
                            type="button"
                            className="btn-cancel-modal"
                            onClick={() => setRespondingReportId(null)}
                          >
                            Batal
                          </button>
                          <button type="submit" className="btn-send-reply">
                            <Send size={14} /> Kirim Arahan Medis ke PMO
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className="btn-trigger-reply"
                        onClick={() => {
                          setRespondingReportId(rep.id);
                          setDoctorResponseText('');
                        }}
                      >
                        <Stethoscope size={15} /> Berikan Tanggapan / Arahan Medis
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Modal */}
      <PrintResumeModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={selectedRecordForPrint}
        patient={{
          name: ehrPatientName,
          nik: ehrNik,
          noRm: ehrNoRm,
          gender: 'Laki-laki',
          age: 24,
          address: 'Kecamatan Mekar Jaya'
        }}
      />
    </div>
  );
}
