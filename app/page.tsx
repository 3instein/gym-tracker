import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
        <div className="" id="push-day">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Push Day
          </h1>
          <table className="table-auto text-center">
            <thead>
              <tr>
                <th className="px-5 py-3">Exercise</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Reps</th>
                <th className="px-5 py-3">Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-5 py-3">Incline Bench Press</td>
                <td className="border px-5 py-3">Monday, 6.33 AM</td>
                <td className="border px-5 py-3">8</td>
                <td className="border px-5 py-3">40</td>
              </tr>
              <tr>
                <td className="border px-5 py-3">Incline Bench Press</td>
                <td className="border px-5 py-3">Monday, 6.29 AM</td>
                <td className="border px-5 py-3">8</td>
                <td className="border px-5 py-3">40</td>
              </tr>
              <tr>
                <td className="border px-5 py-3">Incline Bench Press</td>
                <td className="border px-5 py-3">Monday, 6.24 AM</td>
                <td className="border px-5 py-3">8</td>
                <td className="border px-5 py-3">40</td>
              </tr>
            </tbody>
          </table>
        </div>
        <br />
        <div className="" id="pull-day">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Pull Day
          </h1>
          <table className="table-auto text-center">
            <thead>
              <tr>
                <th className="px-5 py-3">Exercise</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Reps</th>
                <th className="px-5 py-3">Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-5 py-3">Deadlift</td>
                <td className="border px-5 py-3">Yesterday, 6.53 AM</td>
                <td className="border px-5 py-3">12</td>
                <td className="border px-5 py-3">40</td>
              </tr>
              <tr>
                <td className="border px-5 py-3">Deadlift</td>
                <td className="border px-5 py-3">Yesterday, 6.49 AM</td>
                <td className="border px-5 py-3">10</td>
                <td className="border px-5 py-3">40</td>
              </tr>
              <tr>
                <td className="border px-5 py-3">Deadlift</td>
                <td className="border px-5 py-3">Yesterday, 6.45 AM</td>
                <td className="border px-5 py-3">8</td>
                <td className="border px-5 py-3">40</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  )
}
